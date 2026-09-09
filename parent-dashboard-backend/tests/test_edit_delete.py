import pytest


@pytest.fixture()
def setup(client, auth_headers):
    """One parent with a child and a log; plus a second parent."""
    a = auth_headers(email="a@example.com")
    b = auth_headers(email="b@example.com")
    child = client.post("/children", json={"name": "Kid A", "birth_year": 2018}, headers=a).json()
    log = client.post(
        "/logs",
        json={"child_id": child["id"], "date": "2026-09-01", "type": "home_practice", "notes": "n"},
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
    assert body["type"] == "home_practice"  # untouched field preserved
    assert body["date"] == "2026-09-01"


def test_edit_log_validates(setup):
    client, a, _, _, log = setup
    assert client.patch(
        f"/logs/{log['id']}", json={"mood_rating": 9}, headers=a
    ).status_code == 422
    assert client.patch(
        f"/logs/{log['id']}", json={"type": "banana"}, headers=a
    ).status_code == 422
    assert client.patch(
        f"/logs/{log['id']}", json={"time_of_day": "midnight"}, headers=a
    ).status_code == 422


def test_time_of_day(setup):
    client, a, _, child, _ = setup
    made = client.post(
        "/logs",
        json={
            "child_id": child["id"],
            "date": "2026-09-01",
            "type": "appointment",
            "time_of_day": "afternoon",
        },
        headers=a,
    )
    assert made.status_code == 201
    assert made.json()["time_of_day"] == "afternoon"

    cleared = client.patch(
        f"/logs/{made.json()['id']}", json={"time_of_day": None}, headers=a
    )
    assert cleared.json()["time_of_day"] is None


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

    client, a, b, child, _ = setup  # setup's log is dated far enough back not to count

    def add(days_ago):
        client.post(
            "/logs",
            json={
                "child_id": child["id"],
                "date": (date.today() - timedelta(days=days_ago)).isoformat(),
                "type": "home_practice",
            },
            headers=a,
        )

    add(30)  # stale — must not count
    add(2)   # within the week
    add(0)   # today

    s = client.get("/auth/stats", headers=a).json()
    assert s["children"] == 1
    assert s["logs_this_week"] == 2
    assert s["per_child"][str(child["id"])] == 2

    assert client.get("/auth/stats", headers=b).json() == {
        "children": 0, "logs_this_week": 0, "documents": 0, "per_child": {}
    }
