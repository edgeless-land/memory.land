import math
from datetime import datetime, timedelta
from db.client import eldbcc
from fastapi import APIRouter
from fastapi.exceptions import HTTPException

leaderboard_router = APIRouter()

INITIALS_BLACK_LIST = [
    "aass",
    "anus",
    "arse",
    "asss",
    "clit",
    "cock",
    "cunt",
    "dick",
    "fuck",
    "gook",
    "jizz",
    "shit",
    "shiz",
    "tits",
    "twat",
    "wank",
]


@leaderboard_router.put("/")
async def add_score_to_leaderboard(score: int, initials: str = "????"):
    """
    Add a score to the leaderboard.
    """
    global LAST_PUT

    if len(initials) != 4:
        raise HTTPException(400, "Initials must be 4 characters long.")

    if initials.isalpha() is False:
        raise HTTPException(400, "Initials must be alphabetic.")
    
    if initials.lower() in INITIALS_BLACK_LIST:
        raise HTTPException(400, "Initials are not allowed.")

    await eldbcc["Memory"]["Leaderboard"].insert_one(
        {
            "user": {
                "_id": "guest",  # No auth yet, so everyone is a guest
                "initials": initials.lower(),
            },
            "score": score,
            "achieved_at": datetime.utcnow(),
        }
    )

    return "added"


@leaderboard_router.get("/")
async def get_leaderboard(amount: int = 10):
    """
    Get the leaderboard.
    """

    if amount > 100:
        raise HTTPException(400, "Can only get up to 100 scores at a time.")

    leaderboard = (
        await eldbcc["Memory"]["Leaderboard"]
        .find({}, sort=[("score", -1), ("achieved_at", -1)])
        .to_list(amount)
    )

    return [
        {
            "position": i + 1,
            "user": leaderboard["user"],
            "score": leaderboard["score"],
            "achieved_at": leaderboard["achieved_at"],
        }
        for i, leaderboard in enumerate(leaderboard)
    ]
