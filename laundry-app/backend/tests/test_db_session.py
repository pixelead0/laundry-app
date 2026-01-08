import pytest
from app.db.session import get_db

@pytest.mark.asyncio
async def test_get_db():
    # Test that get_db yields a session
    # We can't easily mock the global SessionLocal without patching
    # But we can verify it returns an async generator
    gen = get_db()
    assert hasattr(gen, "__aiter__")

    # Actually actuate it? Requires the engine to be valid.
    # The default engine points to a file or memory logic.
    # Be careful not to create a real DB file during testing if possible,
    # but the config uses a default value.
    # Ideally we mock SessionLocal.

    from unittest.mock import MagicMock, AsyncMock, patch

    mock_session = AsyncMock()
    mock_session_cls = MagicMock(return_value=mock_session)
    mock_session.__aenter__.return_value = "session_obj"

    with patch("app.db.session.SessionLocal", mock_session_cls):
         async for session in get_db():
             assert session == "session_obj"
