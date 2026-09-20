from fastapi import HTTPException, status

class CycloneException(HTTPException):
    def __init__(self, status_code: int, code: str, message: str, details: dict = None):
        super().__init__(
            status_code=status_code,
            detail={
                "error": {
                    "code": code,
                    "message": message,
                    "details": details or {}
                }
            }
        )

class InsufficientDataException(CycloneException):
    def __init__(self, missing_modalities: list):
        super().__init__(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            code="INSUFFICIENT_DATA",
            message="Required observations are unavailable for reliable inference.",
            details={"missing_modalities": missing_modalities}
        )

class StormNotFoundException(CycloneException):
    def __init__(self, storm_id: str):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            code="STORM_NOT_FOUND",
            message=f"Storm with ID '{storm_id}' was not found.",
            details={"storm_id": storm_id}
        )
