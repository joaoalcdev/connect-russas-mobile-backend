from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response, JSONResponse
from sqlalchemy.orm import Session
from app.database.db import get_db
from app.models.whatsapp_user import UserRegisterRequest, RequestCheck, UserResponse
from app.services.whatsapp_user import check_user_exists, register_user, check_user_requests
from app.core.security import verify_twilio_request

router = APIRouter(prefix="/user", tags=["Users"])


@router.post("/check")
async def check_user(request: RequestCheck, db: Session = Depends(get_db), _=Depends(verify_twilio_request)):
    try:
        exists = check_user_exists(request.user_phone, db)
        return {"exists": exists}
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error checking user: {str(e)}")


@router.post("/register")
async def user_data(request: UserRegisterRequest, db: Session = Depends(get_db), _=Depends(verify_twilio_request)):
    try:
        user = register_user(
            name=request.name,
            cpf=request.cpf,
            phone=request.phone,
            birth_date=request.birthdate,
            db=db
        )
        return user
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error registering user: {str(e)}")


@router.post("/check_request")
async def check_request(request: RequestCheck, db: Session = Depends(get_db), _=Depends(verify_twilio_request)):
    try:
        messages, valid = check_user_requests(request.user_phone, db)
        return JSONResponse(content={"messages": messages, "valid": valid}, status_code=200)
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error checking requests: {str(e)}")
