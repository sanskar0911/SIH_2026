from fastapi import HTTPException, status
from typing import Any, Dict, Optional

class APIException(HTTPException):
    def __init__(
        self,
        code: str,
        message: str,
        status_code: int = status.HTTP_400_BAD_REQUEST,
        details: Optional[Dict[str, Any]] = None
    ):
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

class InsufficientDataException(APIException):
    def __init__(self, message: str = "Required observations are unavailable.", details: Optional[Dict[str, Any]] = None):
        super().__init__(
            code="INSUFFICIENT_DATA",
            message=message,
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            details=details
        )

class StormNotFoundException(APIException):
    def __init__(self, storm_id: str):
        super().__init__(
            code="STORM_NOT_FOUND",
            message=f"Storm with ID '{storm_id}' was not found.",
            status_code=status.HTTP_404_NOT_FOUND,
            details={"storm_id": storm_id}
        )
