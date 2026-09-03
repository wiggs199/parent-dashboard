import pytest


@pytest.fixture()
def child(client, auth_headers):
    a = auth_headers(email="a@example.com")
    c = client.post("/children", json={"name": "Sam"}, headers=a).json()
    return client, a, c


def test_new_child_has_empty_profile(child):
    _, _, c = child
    assert c["birth_year"] is None
    assert c["focus_areas"] == []
    assert c["profile_notes"] is None


def test_set_and_clear_profile_fields(child):
    client, a, c = child
    r = client.patch(
        f"/children/{c['id']}",
        json={
            "birth_year": 2018,
            "focus_areas": ["speech", " speech ", "OT", ""],
            "profile_notes": "Loves trains.",
        },
        headers=a,
    )
    assert r.status_code == 200
    body = r.json()
    assert body["birth_year"] == 2018
    assert body["focus_areas"] == ["speech", "OT"]  # trimmed + de-duped, blanks dropped
    assert body["profile_notes"] == "Loves trains."

    # clearing birth_year
    r = client.patch(f"/children/{c['id']}", json={"birth_year": None}, headers=a)
    assert r.json()["birth_year"] is None
    assert r.json()["focus_areas"] == ["speech", "OT"]  # untouched


def test_rename_does_not_wipe_profile(child):
    client, a, c = child
    client.patch(
        f"/children/{c['id']}", json={"focus_areas": ["PT"], "birth_year": 2020}, headers=a
    )
    r = client.patch(f"/children/{c['id']}", json={"name": "Samuel"}, headers=a)
    assert r.json()["name"] == "Samuel"
    assert r.json()["focus_areas"] == ["PT"]
    assert r.json()["birth_year"] == 2020


def test_profile_validation(child):
    client, a, c = child
    assert client.patch(
        f"/children/{c['id']}", json={"birth_year": 1500}, headers=a
    ).status_code == 422
    assert client.patch(
        f"/children/{c['id']}", json={"focus_areas": ["x"] * 20}, headers=a
    ).status_code == 422
