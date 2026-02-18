from fastapi.testclient import TestClient
from unittest.mock import AsyncMock, MagicMock, patch
import pytest
import jwt

from main import app, create_access_token, SECRET_KEY, ALGORITHM


# ---------------------------------------------------------------------------
# Helper: build a TestClient that skips the real Prisma lifespan
# ---------------------------------------------------------------------------
@pytest.fixture
def client():
    mock_db = MagicMock()
    mock_db.connect = AsyncMock()
    mock_db.disconnect = AsyncMock()

    with patch("main.Prisma", return_value=mock_db):
        with TestClient(app) as c:
            yield c


# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------
def test_hello(client):
    response = client.get("/hello")
    assert response.status_code == 200
    assert response.json() == {"message": "Hello World"}


def test_create_access_token_contains_email():
    token = create_access_token("user-123", "test@example.com")
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    assert payload["email"] == "test@example.com"
    assert payload["sub"] == "user-123"


def test_create_access_token_has_expiry():
    token = create_access_token("user-123", "test@example.com")
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    assert "exp" in payload
