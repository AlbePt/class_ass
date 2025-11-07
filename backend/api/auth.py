from __future__ import annotations

from datetime import timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr

from backend.core.security import (
    clear_login_cookie,
    create_access_token,
    get_password_hash,
    set_login_cookie,
    verify_password,
)
from backend.core.services.user_service import User, authenticate_user, create_user, get_user_by_email

router = APIRouter()


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str


class RegisterResponse(BaseModel):
    email: EmailStr


@router.post("/register", response_model=RegisterResponse, status_code=status.HTTP_201_CREATED)
async def register(request: RegisterRequest) -> RegisterResponse:
    if len(request.password) < 6:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Password too short")
    if get_user_by_email(request.email):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="User already exists")
    hashed = get_password_hash(request.password)
    user = create_user(request.email, hashed)
    return RegisterResponse(email=user.email)


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


@router.post("/login", response_model=LoginResponse)
async def login(
    response: Response,
    form_data: OAuth2PasswordRequestForm = Depends(),
) -> LoginResponse:
    user = authenticate_user(form_data.username, form_data.password, verify_password)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect credentials")
    token = create_access_token({"sub": user.email})
    set_login_cookie(response, token)
    return LoginResponse(access_token=token)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(response: Response) -> Response:
    clear_login_cookie(response)
    return response
