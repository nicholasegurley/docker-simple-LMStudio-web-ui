from fastapi.testclient import TestClient
from app.main import app


def test_healthz():
    c = TestClient(app)
    r = c.get("/api/healthz")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"
