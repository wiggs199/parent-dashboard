"""AI features — the activity summary and document extraction.

Guardrail, non-negotiable: this describes/extracts what's literally in the
parent's own data (log entries, uploaded documents). It never scores,
assesses, diagnoses, or advises. See parent-dashboard-vision for why that
line matters.
"""

import base64
from typing import Iterable

import anthropic

from app.config import ANTHROPIC_API_KEY

MODEL = "claude-sonnet-5"

_IMAGE_TYPES = {"image/jpeg", "image/png", "image/gif", "image/webp"}

SYSTEM_PROMPT = """You write a short, factual summary of a parent's activity log for their \
child, {name}, so the parent can hand it to a school, therapist, or insurer.

Rules, no exceptions:
- Describe only what is literally present in the entries below: how often \
things were logged, which types of entries appear, patterns in timing, and \
anything the parent wrote in their own notes.
- Never assess, score, or judge progress. Never say whether {name} is "on \
track," "behind," "improving," or "doing well" — that judgment isn't yours \
to make.
- Never give advice, a recommendation, or a suggested next step.
- Never diagnose, or speculate about a condition or its cause.
- Write 2-4 plain sentences, no headings or bullet points.
- If the entries don't support a meaningful pattern, say that plainly \
instead of inventing one."""


class AIUnavailable(Exception):
    """Raised when no Anthropic API key is configured."""


class UnsupportedDocument(Exception):
    """Raised when a document's file type can't be read for extraction."""


def _format_entry(entry: dict) -> str:
    bits = [entry["date"], entry["type"]]
    if entry.get("time_of_day"):
        bits.append(entry["time_of_day"])
    if entry.get("mood_rating"):
        bits.append(f"mood {entry['mood_rating']}/5")
    line = " · ".join(bits)
    if entry.get("practiced_items"):
        line += f" — {entry['practiced_items']}"
    if entry.get("notes"):
        line += f" (notes: {entry['notes']})"
    return line


def generate_activity_summary(child_name: str, entries: Iterable[dict]) -> str:
    """Summarize `entries` (dicts with date/type/time_of_day/mood_rating/
    practiced_items/notes) for `child_name`. Raises AIUnavailable if no key
    is configured; caller should turn that into a 503."""
    if not ANTHROPIC_API_KEY:
        raise AIUnavailable("ANTHROPIC_API_KEY is not configured")

    entries = list(entries)
    if not entries:
        return "No entries in this range to summarize."

    lines = "\n".join(_format_entry(e) for e in entries)

    client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)
    response = client.messages.create(
        model=MODEL,
        max_tokens=300,
        system=SYSTEM_PROMPT.format(name=child_name),
        messages=[{"role": "user", "content": f"Entries:\n{lines}"}],
    )
    return response.content[0].text.strip()


EXTRACT_SYSTEM_PROMPT = """You extract literal facts from a document a parent uploaded to \
their child's care record — things like an IEP or an insurance letter.

Rules, no exceptions:
- Extract only facts that are literally stated in the document. Never \
infer, estimate, or fill in a plausible-sounding value that isn't \
actually there.
- Never assess, judge, or comment on whether goals are appropriate, \
whether services are adequate, or what the parent should do about any of \
this.
- For an IEP: look for stated goals, the annual review date, service \
minutes per week or session frequency, and which providers/services are \
listed.
- For an insurance letter or EOB: look for the authorized session/unit \
count, the date range it covers, whether it's an approval or a denial, \
and any appeal deadline.
- For anything else: extract only obviously factual identifying details — \
dates, provider or organization names, what the document is about.
- If a field isn't present, leave it out rather than guessing.
- If the document is unclear, cut off, or hard to read, say so plainly in \
the note field instead of guessing at its contents."""

EXTRACT_TOOL = {
    "name": "record_extracted_fields",
    "description": "Record the literal facts found in the document.",
    "input_schema": {
        "type": "object",
        "properties": {
            "document_type": {
                "type": "string",
                "enum": ["iep", "insurance_letter", "other"],
                "description": "Best guess at what kind of document this is, based only on its content.",
            },
            "fields": {
                "type": "array",
                "description": "Each literal fact found, as a short label and its value.",
                "items": {
                    "type": "object",
                    "properties": {
                        "label": {"type": "string"},
                        "value": {"type": "string"},
                    },
                    "required": ["label", "value"],
                },
            },
            "note": {
                "type": "string",
                "description": "Plain-language note if the document is unclear, unreadable, cut off, or doesn't match a known type. Empty string if there's nothing to flag.",
            },
        },
        "required": ["document_type", "fields", "note"],
    },
}


def extract_document_fields(file_bytes: bytes, content_type: str) -> dict:
    """Read a document (PDF or image) and return {document_type, fields,
    note}. Raises AIUnavailable if no key is configured, UnsupportedDocument
    if the file type can't be read — caller turns those into 503 / 422."""
    if not ANTHROPIC_API_KEY:
        raise AIUnavailable("ANTHROPIC_API_KEY is not configured")

    if content_type == "application/pdf":
        block_type = "document"
    elif content_type in _IMAGE_TYPES:
        block_type = "image"
    else:
        raise UnsupportedDocument(
            "This file type can't be read yet — try a PDF or a photo/scan (JPEG or PNG)."
        )

    data = base64.standard_b64encode(file_bytes).decode("ascii")
    client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)
    response = client.messages.create(
        model=MODEL,
        max_tokens=1024,
        system=EXTRACT_SYSTEM_PROMPT,
        tools=[EXTRACT_TOOL],
        tool_choice={"type": "tool", "name": "record_extracted_fields"},
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": block_type,
                        "source": {
                            "type": "base64",
                            "media_type": content_type,
                            "data": data,
                        },
                    },
                    {"type": "text", "text": "Extract the relevant fields from this document."},
                ],
            }
        ],
    )
    for piece in response.content:
        if piece.type == "tool_use":
            return piece.input
    raise AIUnavailable("The model didn't return structured output.")
