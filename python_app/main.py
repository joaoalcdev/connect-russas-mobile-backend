from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import uvicorn
from app.routes import whatsapp_report, whatsapp_user
from app.core.config import get_settings
from slowapi.util import get_remote_address
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.middleware import SlowAPIMiddleware

load_dotenv()
settings = get_settings()
limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title="Cid Connect API",
    description="API for citizen request management",
    version="1.0.0"
)

app.state.limiter = limiter
app.add_exception_handler(429, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["POST"],
    allow_headers=["Authorization", "Content-Type"],
)

app.add_middleware(SlowAPIMiddleware)

app.include_router(whatsapp_user.router)
app.include_router(whatsapp_report.router)

@app.get("/")
@limiter.limit("2/minute")
async def root(request: Request):
    return {"message": "Welcome to Cid Connect API!"}

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="localhost",
        port=8080,
        reload=settings.ENVIRONMENT == "development"
    )
