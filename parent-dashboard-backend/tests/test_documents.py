import io

import pytest


@pytest.fixture()
def ready_child(client, auth_headers):
    """A parent + a child with the basics filled in (so uploads are allowed)."""
    a = auth_headers(email="a@example.com")
    c = client.post("/children", json={"name": "Rae"}, headers=a).json()
    client.patch(
        f"/children/{c['id']}",
        json={"birth_year": 2017, "focus_areas": ["Speech / language"]},
        headers=a,
    )
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


def test_upload_blocked_until_child_has_basics(client, auth_headers):
    a = auth_headers(email="a@example.com")
    c = client.post("/children", json={"name": "Nel"}, headers=a).json()

    r = upload(client, a, c["id"])
    assert r.status_code == 400
    assert "birth year" in r.json()["detail"]

    client.patch(f"/children/{c['id']}", json={"birth_year": 2019, "focus_areas": ["OT"]}, headers=a)
    assert upload(client, a, c["id"]).status_code == 201


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
