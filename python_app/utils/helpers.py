def extract_phone_number(phone: str) -> str:
    return phone.replace("whatsapp:", "")


def format_address(request) -> str:
    if request.location:
        return request.location
    if request.cep:
        return request.cep
    if request.latitude and request.longitude:
        return f"Lat: {request.latitude}, Long: {request.longitude}"
    return "Not informed"
