from pydantic import BaseModel
from typing import Optional
from datetime import date


class ReportRequest(BaseModel):
    phone: str
    name: Optional[str] = None
    problem_description: Optional[str] = None
    problem_selected: str
    location: Optional[str] = None
    latitude: Optional[str] = None
    longitude: Optional[str] = None
    neighborhood: str
    cep: Optional[str] = None
    image_url: Optional[str] = None


class ReportResponse(BaseModel):
    request_number: int
    problem: str
    problem_description: Optional[str]
    image_url: Optional[str]
    neighborhood: str
    address: str
    status: str
    date: date

    class Config:
        from_attributes = True
