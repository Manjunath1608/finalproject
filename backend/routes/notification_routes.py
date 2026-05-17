from fastapi import APIRouter, Depends
from routes.auth_routes import get_current_user
from typing import List, Dict, Any

notification_router = APIRouter()

@notification_router.get("/", response_model=List[Dict[str, Any]])
def get_notifications(current_user = Depends(get_current_user)):
    """
    Get notifications for the current user.
    Mocked for now - in production this would query a notifications collection.
    """
    # Mock notifications based on role
    role = current_user.role
    notifications = []
    
    if role == "donor":
        notifications.append({
            "id": 1, 
            "message": "Thank you for registering as a donor! Remember to update your health status.",
            "is_read": False,
            "date": "2023-10-27"
        })
    elif role == "hospital":
        notifications.append({
            "id": 2, 
            "message": "System Alert: High urgency request for Kidney (O+) just received.",
            "is_read": False,
            "date": "2023-10-28"
        })
    elif role == "recipient":
        notifications.append({
            "id": 3, 
            "message": "Your request for Kidney is being processed by the matching engine.",
            "is_read": True,
            "date": "2023-10-26"
        })
        
    return notifications
