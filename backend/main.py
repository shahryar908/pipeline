from fastapi import Depends, FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from prisma import Prisma
from contextlib import asynccontextmanager
from pydantic import BaseModel, EmailStr
import bcrypt
import jwt
import os
from datetime import datetime, timedelta, timezone

SECRET_KEY = os.environ.get("JWT_SECRET", "changeme")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30


def create_access_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


class SignupRequest(BaseModel):
    email: EmailStr
    password: str


class SigninRequest(BaseModel):
    email: EmailStr
    password: str


@asynccontextmanager
async def lifespan(app: FastAPI):
    db = Prisma()
    await db.connect()
    app.state.db = db
    yield
    await db.disconnect()


async def get_db(request: Request) -> Prisma:
    return request.app.state.db


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/hello")
async def root():
    return {"message": "Hello World"}


@app.post("/signup", status_code=status.HTTP_201_CREATED)
async def signup(req: SignupRequest, db: Prisma = Depends(get_db)):
    user = await db.user.find_unique(where={"email": req.email})
    if user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already exists"
        )
    hashed = bcrypt.hashpw(req.password.encode(), bcrypt.gensalt()).decode()
    new_user=await db.user.create(data={"email": req.email, "password": hashed})
    return {"message": "User created successfully",
            "user": {"id": new_user.id, "email": new_user.email}}

@app.post("/login")
async def login(req: SigninRequest, db: Prisma = Depends(get_db)):
    user = await db.user.find_unique(where={"email": req.email})
    if not user or not bcrypt.checkpw(req.password.encode(), user.password.encode()):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    token = create_access_token(user.id, user.email)
    return {"message": "Login successful", "access_token": token, "token_type": "bearer"}

@app.get ("/users")
async def get_users(db: Prisma = Depends(get_db)):
    users = await db.user.find_many()
    return {"users": [{"id": user.id, "email": user.email,"password": user.password} for user in users]}