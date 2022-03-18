from fastapi import FastAPI

api = FastAPI()

@api.get("/ping")
def ping():
    return "pong"