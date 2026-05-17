from pydantic import BaseModel, Field
from typing import Literal, Annotated, List, Optional


BloodGroup = Annotated[str, Field(pattern=r"^(A|B|AB|O)[+-]$")]


class DonationRequest(BaseModel):
    id: Optional[str] = None
    user_id: Optional[str] = None  # Link to Recipient (optional during submission)
    patient_name: str = Field(min_length=1)
    age: int = Field(ge=0, le=120)
    blood_group: BloodGroup
    organ: Annotated[str, Field(min_length=2, example="Liver")]
    quantity: Optional[int] = 1 # Units of blood
    hospital_location: str = Field(min_length=3)
    urgency: Literal["low", "medium", "high", "critical"]
    required_date: str # ISO Date string
    health_condition: Optional[str] = None
    consent_agreement: bool = False
    status: Literal["pending", "matched", "fulfilled", "cancelled"] = "pending"
    matches: List[dict] = []
    created_at: Optional[str] = None
