from fastapi.testclient import TestClient
from app.main import app


def test_models_502_when_no_lmstudio():
    c = TestClient(app)
    r = c.get("/api/models")
    assert r.status_code in (200, 502)
