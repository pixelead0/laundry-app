import pytest
from unittest.mock import AsyncMock
from app.services.websocket import ConnectionManager

@pytest.mark.asyncio
async def test_websocket_manager():
    manager = ConnectionManager()

    # Mock WebSocket
    mock_ws = AsyncMock()

    # Test Connect
    await manager.connect(mock_ws)
    assert len(manager.active_connections) == 1
    assert manager.active_connections[0] == mock_ws

    # Test Broadcast
    await manager.broadcast({"message": "test"})
    mock_ws.send_json.assert_called_with({"message": "test"})

    # Test Disconnect
    manager.disconnect(mock_ws)
    assert len(manager.active_connections) == 0
