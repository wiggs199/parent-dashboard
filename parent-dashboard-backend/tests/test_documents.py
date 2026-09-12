import io

import pytest


@pytest.fixture()
def ready_child(client, auth_headers):
    """A parent + a child."""
    a = auth_headers(email="a@example.com")
    c = client.post("/children", json={"name": "Rae", "birth_year": 2018}, headers=a).json()
    return client, a, c


def upload(client, headers, child_id, name="report.pdf", data=b"%PDF-1.4 fake", category="therapist"):
    return client.post(
        "/documents",
        data={"child_id": child_id, "category": category},
        files={"file": (name, io.BytesIO(data), "application/pdf")},
        headers=headers,
    )


def test_upload_list_download_delete(ready_child):
    client, a, c = ready_child

    r = upload(client, a, c["id"])
    assert r.status_code == 201
    doc = r.json()
    assert doc["filename"] == "report.pdf"
    assert doc["category"] == "therapist"
    assert doc["size_bytes"] == len(b"%PDF-1.4 fake")

    listed = client.get(f"/documents/child/{c['id']}", headers=a).json()
    assert [d["id"] for d in listed] == [doc["id"]]

    dl = client.get(f"/documents/{doc['id']}/download", headers=a)
    assert dl.status_code == 200
    assert dl.content == b"%PDF-1.4 fake"
    assert "report.pdf" in dl.headers["content-disposition"]

    assert client.delete(f"/documents/{doc['id']}", headers=a).status_code == 204
    assert client.get(f"/documents/child/{c['id']}", headers=a).json() == []


def test_upload_needs_a_real_child(client, auth_headers):
    a = auth_headers(email="a@example.com")
    assert upload(client, a, 9999).status_code == 404


def test_documents_scoped_to_owner(ready_child, auth_headers):
    client, a, c = ready_child
    b = auth_headers(email="b@example.com")

    assert upload(client, b, c["id"]).status_code == 404

    doc = upload(client, a, c["id"]).json()
    assert client.get(f"/documents/child/{c['id']}", headers=b).status_code == 404
    assert client.get(f"/documents/{doc['id']}/download", headers=b).status_code == 404
    assert client.delete(f"/documents/{doc['id']}", headers=b).status_code == 404


def test_rejects_empty_and_bad_category(ready_child):
    client, a, c = ready_child
    assert upload(client, a, c["id"], data=b"").status_code == 422
    assert upload(client, a, c["id"], category="nonsense").status_code == 422


def test_deleting_child_removes_its_documents(ready_child):
    client, a, c = ready_child
    upload(client, a, c["id"])
    assert client.delete(f"/children/{c['id']}", headers=a).status_code == 204
    # child gone -> its document listing 404s
    assert client.get(f"/documents/child/{c['id']}", headers=a).status_code == 404


def test_name_on_upload_and_rename_later(ready_child):
    client, a, c = ready_child

    # name given at upload time
    doc = client.post(
        "/documents",
        data={"child_id": c["id"], "category": "school", "display_name": "IEP draft"},
        files={"file": ("messy_scan_final(2).pdf", io.BytesIO(b"%PDF x"), "application/pdf")},
        headers=a,
    ).json()
    assert doc["filename"] == "IEP draft.pdf"  # extension borrowed from the real file

    # rename afterwards
    r = client.patch(f"/documents/{doc['id']}", json={"filename": "IEP - final"}, headers=a)
    assert r.status_code == 200 and r.json()["filename"] == "IEP - final.pdf"

    # download uses the display name, extension intact
    dl = client.get(f"/documents/{doc['id']}/download", headers=a)
    assert "IEP%20-%20final.pdf" in dl.headers["content-disposition"]

    # recategorise
    assert client.patch(
        f"/documents/{doc['id']}", json={"category": "insurance"}, headers=a
    ).json()["category"] == "insurance"


def test_rename_respects_ownership(ready_child, auth_headers):
    client, a, c = ready_child
    b = auth_headers(email="b@example.com")
    doc = upload(client, a, c["id"]).json()
    assert client.patch(f"/documents/{doc['id']}", json={"filename": "x"}, headers=b).status_code == 404


def test_extract_503_without_api_key(ready_child):
    """No ANTHROPIC_API_KEY configured (the default in dev/CI) -> a clear
    503 instead of a fake or silent extraction."""
    client, a, c = ready_child
    doc = upload(client, a, c["id"]).json()
    assert client.post(f"/documents/{doc['id']}/extract", headers=a).status_code == 503


def test_extract_respects_ownership(ready_child, auth_headers):
    client, a, c = ready_child
    b = auth_headers(email="b@example.com")
    doc = upload(client, a, c["id"]).json()
    assert client.post(f"/documents/{doc['id']}/extract", headers=b).status_code == 404


def test_extract_rejects_unreadable_file_type(ready_child, monkeypatch):
    """A configured key but an unsupported file type -> 422, not a 503."""
    import app.ai as ai

    monkeypatch.setattr(ai, "ANTHROPIC_API_KEY", "fake-key-for-test")

    client, a, c = ready_child
    doc = client.post(
        "/documents",
        data={"child_id": c["id"], "category": "other"},
        files={"file": ("notes.txt", io.BytesIO(b"plain text"), "text/plain")},
        headers=a,
    ).json()

    r = client.post(f"/documents/{doc['id']}/extract", headers=a)
    assert r.status_code == 422
