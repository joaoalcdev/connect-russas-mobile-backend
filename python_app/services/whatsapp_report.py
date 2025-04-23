from sqlalchemy.orm import Session
from app.database.models import Report, User, Neighborhood, Occurrence
from app.models.whatsapp_report import ReportRequest
from app.utils.helpers import extract_phone_number, format_address
from datetime import datetime
from fastapi import HTTPException

async def create_report(request: ReportRequest, db: Session) -> str:
    phone = extract_phone_number(request.phone)
    current_date = datetime.now().date()

    user = db.query(User).filter(User.phone == phone).first()

    neighborhood = db.query(Neighborhood).filter(Neighborhood.name == request.neighborhood).first()

    occurrence = db.query(Occurrence).filter(
        Occurrence.occurrence_name == request.problem_selected).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not registered")
    if not neighborhood:
        raise HTTPException(status_code=400, detail="Invalid neighborhood")
    if not occurrence or occurrence not in neighborhood.occurrences:
        raise HTTPException(
            status_code=400, detail="Invalid problem for this neighborhood")

    report = Report(
        problem_id=occurrence.occurrence_id,
        problem_description=request.problem_description or "",
        image_url=request.image_url or "",
        neighborhood_id=neighborhood.neighborhood_id,
        address=format_address(request),
        status="Em andamento",
        date=current_date,
        user_phone=phone
    )

    db.add(report)
    db.commit()
    db.refresh(report)

    message = (
        f"Solicitação *N° {report.request_number}* criada!\n"
        f"Problema: *{report.occurrence.occurrence_name}*\n"
        f"Bairro: *{neighborhood.name}*\n"
        f"Endereço: *{report.address}*\n"
        f"Status: *{report.status}* desde {report.date.strftime('%d/%m/%Y')}"
    )
    
    return message


def get_neighborhoods_data(db: Session):
    neighborhoods = db.query(Neighborhood).all()
    return [
        {
            "name": neighborhood.name
        }
        for neighborhood in neighborhoods
    ]

def get_occurrences_data(db: Session):
    occurrences = db.query(Occurrence).all()
    return [
        {
            "name": occurrence.occurrence_name
        }
        for occurrence in occurrences
    ]