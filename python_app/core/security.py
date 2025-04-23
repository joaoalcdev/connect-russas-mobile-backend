from fastapi import Request, HTTPException
from twilio.request_validator import RequestValidator


async def verify_twilio_request(request: Request):
    from app.core.config import get_settings

    settings = get_settings()

    validator = RequestValidator(settings.TWILIO_AUTH_TOKEN)
    signature = request.headers.get("X-Twilio-Signature", "")

    url = str(request.url)
    form_data = dict(request.query_params)

    if request.method == "POST":
        form_data = dict(await request.form())

    if not validator.validate(url, form_data, signature):
        raise HTTPException(
            status_code=403, detail="Request not authenticated by Twilio")

    return True
