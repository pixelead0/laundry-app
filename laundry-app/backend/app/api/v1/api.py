from fastapi import APIRouter
from app.api.v1.endpoints import machines, turns, websocket

api_router = APIRouter()

api_router.include_router(machines.router, prefix="/machines", tags=["machines"])
api_router.include_router(turns.router, prefix="/turns", tags=["turns"])
# Websockets are often top-level or specific
api_router.include_router(websocket.router, tags=["websocket"])
