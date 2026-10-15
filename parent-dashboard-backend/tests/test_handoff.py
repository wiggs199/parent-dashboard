def _make_child(client, headers):
    return client.post(
        "/children", json={"name": "Rae", "birth_year": 2018}, headers=headers
    ).json()


def test_generating_a_link_requires_ownership(client, auth_headers):
    a = auth_headers(email="a@example.com")
    b = auth_headers(email="b@example.com")
    child = _make_child(client, a)

    assert client.post(f"/children/{child['id']}/handoff-link", headers=b).status_code == 404
    assert client.delete(f"/children/{child['id']}/handoff-link", headers=b).status_code == 404


def test_generate_fill_in_and_fetch_the_card(client, auth_headers):
    a = auth_headers(email="handoff@example.com")
    child = _make_child(client, a)

    # fill in the handoff fields the normal way -- the existing child PATCH
    client.patch(
        f"/children/{child['id']}",
        json={
            "handoff_helps": "Loves dinosaurs",
            "handoff_avoid": "Loud noises",
            "handoff_communication": "Short phrases",
            "handoff_medical": "Allergic to tree nuts",
            "handoff_contacts": [{"name": "Mom", "phone": "555-0100"}],
            # these should never appear in the public card
            "profile_notes": "private notes only the parent should see",
            "focus_areas": ["Speech / Language"],
        },
        headers=a,
    )

    link = client.post(f"/children/{child['id']}/handoff-link", headers=a).json()
    token = link["token"]
    assert token and len(token) > 20  # real entropy, not a short/guessable id

    r = client.get(f"/handoff/{token}")
    assert r.status_code == 200
    body = r.json()
    assert body["name"] == "Rae"
    assert body["handoff_helps"] == "Loves dinosaurs"
    assert body["handoff_avoid"] == "Loud noises"
    assert body["handoff_medical"] == "Allergic to tree nuts"
    assert body["handoff_contacts"] == [{"name": "Mom", "phone": "555-0100"}]

    # the narrow allowlist -- nothing else about the child leaks through
    leaked = set(body) & {
        "id", "parent_id", "profile_notes", "focus_areas", "handoff_token",
    }
    assert not leaked, f"handoff card leaked fields outside its allowlist: {leaked}"


def test_invalid_token_is_404(client):
    assert client.get("/handoff/not-a-real-token").status_code == 404


def test_revoking_the_link_invalidates_it(client, auth_headers):
    a = auth_headers(email="revoke@example.com")
    child = _make_child(client, a)
    token = client.post(f"/children/{child['id']}/handoff-link", headers=a).json()["token"]

    assert client.get(f"/handoff/{token}").status_code == 200
    assert client.delete(f"/children/{child['id']}/handoff-link", headers=a).status_code == 204
    assert client.get(f"/handoff/{token}").status_code == 404


def test_regenerating_rotates_the_token(client, auth_headers):
    a = auth_headers(email="rotate@example.com")
    child = _make_child(client, a)
    first = client.post(f"/children/{child['id']}/handoff-link", headers=a).json()["token"]
    second = client.post(f"/children/{child['id']}/handoff-link", headers=a).json()["token"]

    assert first != second
    assert client.get(f"/handoff/{first}").status_code == 404
    assert client.get(f"/handoff/{second}").status_code == 200


def test_handoff_contacts_are_capped_and_validated(client, auth_headers):
    a = auth_headers(email="cap@example.com")
    child = _make_child(client, a)

    too_many = [{"name": f"Contact {i}", "phone": "555-0100"} for i in range(5)]
    r = client.patch(
        f"/children/{child['id']}", json={"handoff_contacts": too_many}, headers=a
    )
    assert r.status_code == 422

    r = client.patch(
        f"/children/{child['id']}", json={"handoff_contacts": [{"name": "", "phone": "555"}]},
        headers=a,
    )
    assert r.status_code == 422
