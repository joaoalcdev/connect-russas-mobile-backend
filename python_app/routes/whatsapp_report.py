from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from app.database.db import get_db
from app.models.whatsapp_report import ReportRequest
from app.services.whatsapp_report import create_report, get_neighborhoods_data, get_occurrences_data
from app.core.security import verify_twilio_request

router = APIRouter(prefix="/report", tags=["Reports"])


@router.post("")
async def report_data(request: ReportRequest, db: Session = Depends(get_db), _=Depends(verify_twilio_request)): 
    try:
        message = await create_report(request, db)
        return JSONResponse(content={"message": message}, status_code=200)
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Internal error: {str(e)}")


@router.get("/neighborhoods")
async def get_neighborhoods(db: Session = Depends(get_db), _=Depends(verify_twilio_request)):
    try:
        neighborhoods_data = get_neighborhoods_data(db)
        occurrences_data = get_occurrences_data(db)
        return JSONResponse(content={"neighborhoods": neighborhoods_data, "occurrences": occurrences_data}, status_code=200)
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error getting neighborhoods: {str(e)}")

