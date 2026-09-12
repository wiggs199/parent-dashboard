"""AI summary generation — the one AI feature in the app so far.

Guardrail, non-negotiable: this describes what's literally in the parent's
own entries (frequency, consistency, notes). It never scores, assesses,
diagnoses, or advises. See parent-dashboard-vision for why that line matters.
"""

from typing import Iterable, Optional

import anthropic

from app.config import ANTHROPIC_API_KEY

MODEL = "claude-sonnet-5"

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
