def test_summary_503_without_api_key(client, auth_headers):
    """No ANTHROPIC_API_KEY configured (the default in dev/CI) -> a clear
    503 instead of a fake or silent summary."""
    a = auth_headers(email="ai-summary@example.com")
    child = client.post(
        "/children", json={"name": "Kid A", "birth_year": 2018}, headers=a
    ).json()
    client.post(
        "/logs",
        json={"child_id": child["id"], "date": "2026-01-05", "type": "home_practice"},
        headers=a,
    )

    r = client.get(f"/logs/summary/{child['id']}", headers=a)
    assert r.status_code == 503


def test_summary_respects_date_and_type_filters(client, auth_headers, monkeypatch):
    """The route should query only the filtered entries before ever
    reaching the AI call -- verify by capturing what's handed to it."""
    import app.routes.logs as logs_route

    captured = {}

    def fake_summary(child_name, entries):
        captured["child_name"] = child_name
        captured["entries"] = list(entries)
        return "a summary"

    monkeypatch.setattr(logs_route, "generate_activity_summary", fake_summary)

    a = auth_headers(email="ai-filter@example.com")
    child = client.post(
        "/children", json={"name": "Kid A", "birth_year": 2018}, headers=a
    ).json()
    client.post(
        "/logs",
        json={"child_id": child["id"], "date": "2026-01-05", "type": "home_practice"},
        headers=a,
    )
    client.post(
        "/logs",
        json={"child_id": child["id"], "date": "2026-02-01", "type": "milestone"},
        headers=a,
    )

    r = client.get(
        f"/logs/summary/{child['id']}",
        params={"from": "2026-01-01", "to": "2026-01-31", "types": "home_practice"},
        headers=a,
    )
    assert r.status_code == 200
    assert r.json() == {"summary": "a summary"}
    assert captured["child_name"] == "Kid A"
    assert [e["type"] for e in captured["entries"]] == ["home_practice"]
