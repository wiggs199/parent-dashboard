import pytest


@pytest.fixture()
def setup(client, auth_headers):
    """One parent with a child and a log; plus a second parent."""
    a = auth_headers(email="a@example.com")
    b = auth_headers(email="b@example.com")
    child = client.post("/children", json={"name": "Kid A", "birth_year": 2018}, headers=a).json()
    log = client.post(
        "/logs",
        json={"child_id": child["id"], "date": "2026-09-01", "type": "exercise", "notes": "n"},
        headers=a,
    ).json()
    return client, a, b, child, log


def test_rename_child(setup):
    client, a, b, child, _ = setup
    r = client.patch(f"/children/{child['id']}", json={"name": "Renamed"}, headers=a)
    assert r.status_code == 200 and r.json()["name"] == "Renamed"
    # other parent can't
    assert client.patch(
        f"/children/{child['id']}", json={"name": "Nope"}, headers=b
    ).status_code == 404


def test_delete_child_cascades(setup):
    client, a, b, child, log = setup
    assert client.delete(f"/children/{child['id']}", headers=b).status_code == 404
    assert client.delete(f"/children/{child['id']}", headers=a).status_code == 204
    # child and its log are gone
    assert client.get(f"/children/{child['id']}", headers=a).status_code == 404
    assert client.get(f"/logs/child/{child['id']}", headers=a).status_code == 404


def test_edit_log_partial(setup):
    client, a, _, _, log = setup
    r = client.patch(
        f"/logs/{log['id']}", json={"notes": "updated", "mood_rating": 5}, headers=a
    )
    assert r.status_code == 200
    body = r.json()
    assert body["notes"] == "updated" and body["mood_rating"] == 5
    assert body["type"] == "exercise"  # untouched field preserved
    assert body["date"] == "2026-09-01"


def test_edit_log_validates(setup):
    client, a, _, _, log = setup
    assert client.patch(
        f"/logs/{log['id']}", json={"mood_rating": 9}, headers=a
    ).status_code == 422
    assert client.patch(
        f"/logs/{log['id']}", json={"type": "banana"}, headers=a
    ).status_code == 422


def test_edit_and_delete_log_respect_ownership(setup):
    client, _, b, _, log = setup
    assert client.patch(f"/logs/{log['id']}", json={"notes": "x"}, headers=b).status_code == 404
    assert client.delete(f"/logs/{log['id']}", headers=b).status_code == 404


def test_delete_log(setup):
    client, a, _, child, log = setup
    assert client.delete(f"/logs/{log['id']}", headers=a).status_code == 204
    assert client.get(f"/logs/child/{child['id']}", headers=a).json() == []
    assert client.delete(f"/logs/{log['id']}", headers=a).status_code == 404  # already gone


def test_dashboard_stats(setup):
    from datetime import date, timedelta

    client, a, b, child, _ = setup  # a has 1 child + 1 recent log
    # a stale log (>7 days) must not count
    client.post(
        "/logs",
        json={
            "child_id": child["id"],
            "date": (date.today() - timedelta(days=30)).isoformat(),
            "type": "exercise",
        },
        headers=a,
    )
    # a fresh one that does
    client.post(
        "/logs",
        json={"child_id": child["id"], "date": date.today().isoformat(), "type": "exercise"},
        headers=a,
    )
    s = client.get("/auth/stats", headers=a).json()
    assert s["children"] == 1
    assert s["logs_this_week"] == 2  # the setup log + today's; not the 30-day-old one
    assert s["per_child"][str(child["id"])] == 2

    assert client.get("/auth/stats", headers=b).json() == {
        "children": 0, "logs_this_week": 0, "documents": 0, "per_child": {}
    }
