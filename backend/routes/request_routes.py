from fastapi import APIRouter, HTTPException, status, Depends
from typing import List
from models.request import DonationRequest
from routes.auth_routes import RoleChecker, get_current_user
from services.request_service import RequestService
import logging

request_router = APIRouter()

def get_request_service():
    return RequestService()

@request_router.post("/", response_model=DonationRequest, status_code=status.HTTP_201_CREATED, dependencies=[Depends(RoleChecker(["recipient", "hospital", "admin"]))])
def create_request(req: DonationRequest, current_user: dict = Depends(get_current_user), service: RequestService = Depends(get_request_service)):
    try:
        return service.create_request(req, str(current_user.id))
    except Exception as e:
        logging.getLogger(__name__).exception("Error creating request: %s", e)
        raise HTTPException(status_code=500, detail="Failed to create request")


@request_router.get("/", response_model=List[DonationRequest], dependencies=[Depends(RoleChecker(["recipient", "hospital", "admin", "donor"]))])
def list_requests(current_user: dict = Depends(get_current_user), service: RequestService = Depends(get_request_service)):
    # Filter by user role
    filter_query = {}
    if current_user.role == "recipient":
        filter_query["user_id"] = str(current_user.id)
    elif current_user.role == "hospital":
        # Hospitals only see requests that are ready for action or completed
        filter_query["status"] = {"$in": ["matched", "fulfilled"]}
    elif current_user.role == "donor":
        # Donors can see pending requests to volunteer/match
        # In a real system, we might filter by blood group compatibility here using service logic
        filter_query["status"] = {"$in": ["pending", "matched"]}
        
    return service.list_requests(filter_query=filter_query)


@request_router.put("/{request_id}/volunteer", response_model=DonationRequest, dependencies=[Depends(RoleChecker(["donor"]))])
def volunteer_for_request(request_id: str, current_user = Depends(get_current_user), service: RequestService = Depends(get_request_service)):
    try:
        return service.volunteer_for_request(request_id, str(current_user.id))
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logging.getLogger(__name__).exception("Error volunteering for request: %s", e)
        raise HTTPException(status_code=500, detail="Failed to volunteer")

@request_router.put("/{request_id}/accept", response_model=DonationRequest, dependencies=[Depends(RoleChecker(["recipient", "hospital", "admin"]))])
def accept_match(request_id: str, donor_id: str, current_user = Depends(get_current_user), service: RequestService = Depends(get_request_service)):
    try:
        return service.accept_match(request_id, donor_id, str(current_user.id))
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logging.getLogger(__name__).exception("Error accepting match: %s", e)
        raise HTTPException(status_code=500, detail="Failed to accept match")

@request_router.put("/{request_id}/decline", response_model=DonationRequest, dependencies=[Depends(RoleChecker(["recipient", "hospital", "admin"]))])
def decline_match(request_id: str, donor_id: str, current_user = Depends(get_current_user), service: RequestService = Depends(get_request_service)):
    try:
        return service.decline_match(request_id, donor_id, str(current_user.id))
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logging.getLogger(__name__).exception("Error declining match: %s", e)
        raise HTTPException(status_code=500, detail="Failed to decline match")

@request_router.delete("/{request_id}", response_model=DonationRequest, dependencies=[Depends(RoleChecker(["recipient", "hospital", "admin"]))])
def cancel_request(request_id: str, current_user = Depends(get_current_user), service: RequestService = Depends(get_request_service)):
    try:
        return service.cancel_request(request_id, str(current_user.id))
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logging.getLogger(__name__).exception("Error cancelling request: %s", e)
        raise HTTPException(status_code=500, detail="Failed to cancel request")

