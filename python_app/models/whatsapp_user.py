from pydantic import BaseModel
from datetime import date


class UserRegisterRequest(BaseModel):
    name: str
    cpf: str
    phone: str
    birthdate: str


class UserResponse(BaseModel):
    name: str
    cpf: str
    birth_date: date

    class Config:
        from_attributes = True


class RequestCheck(BaseModel):
    user_phone: str
