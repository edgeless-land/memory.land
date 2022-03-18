import os

from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

load_dotenv()


ELDBC_CONN_STR = os.getenv("ELDBC_CONN_STR")

eldbcc = AsyncIOMotorClient(ELDBC_CONN_STR)
