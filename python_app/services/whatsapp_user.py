from sqlalchemy.orm import Session
from app.database.models import User, Report
from app.models.whatsapp_user import UserResponse
from app.utils.helpers import extract_phone_number
from datetime import datetime
from fastapi import HTTPException


def check_user_exists(user_phone: str, db: Session) -> bool:
    phone = extract_phone_number(user_phone)
    return bool(db.query(User).filter(User.phone == phone).first())


def register_user(name: str, cpf: str, phone: str, birth_date: str, db: Session) -> UserResponse:
    user_phone = extract_phone_number(phone)
    try:
        birth_date_obj = datetime.strptime(birth_date, "%d/%m/%Y").date()
    except ValueError:
        raise HTTPException(
            status_code=400, detail="Invalid date format. Use DD/MM/YYYY")

    user = User(cpf=cpf, name=name, phone=user_phone,
                birth_date=birth_date_obj)
    db.merge(user)
    db.commit()
    return UserResponse(name=user.name, cpf=user.cpf, birth_date=user.birth_date)


def check_user_requests(user_phone: str, db: Session) -> tuple[list[str], bool]:
    phone = extract_phone_number(user_phone)
    active_requests = db.query(Report).filter(
        Report.user_phone == phone,
        Report.status == "In progress"
    ).all()

    if active_requests:
        messages = [
            f"Solicitação *N° {req.request_number}* encontrada!\n"
            f"Problema: *{req.occurrence.occurrence_name}*\n"
            f"Bairro: *{req.neighborhood.name}*\n"
            f"Endereço: *{req.address}*\n"
            f"Status: *{req.status}* desde {req.date.strftime('%d/%m/%Y')}\n\n"
            for req in active_requests
        ]
        return messages, True
    return ["Nenhuma solicitação em andamento encontrada"], False
