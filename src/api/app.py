from fastapi import FastAPI

from routes.leaderboard.router import leaderboard_router

api = FastAPI()


@api.get("/ping", tags=["util"])
def ping():
    return "pong"


api.include_router(leaderboard_router, prefix="/leaderboard", tags=["leaderboard"])
