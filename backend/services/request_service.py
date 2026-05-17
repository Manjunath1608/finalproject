from typing import List, Optional
from models.request import DonationRequest
from repositories.request_repository import RequestRepository
from services.matching_service import MatchingService
from datetime import datetime

class RequestService:
    def __init__(self):
        self.repository = RequestRepository()
        self.matching_service = MatchingService()

    def create_request(self, request: DonationRequest, user_id: str) -> DonationRequest:
        """
        Handle request creation and immediately trigger AI matching.
        """
        # 1. Prepare data
        request_data = request.dict(exclude={'id', 'matches', 'created_at'})
        request_data['user_id'] = user_id
        request_data['status'] = 'pending'
        request_data['created_at'] = datetime.now().isoformat()
        
        # 2. Save to database
        created_request = self.repository.create(DonationRequest(**request_data))
        request_id = str(created_request.id)
        
        # 3. Synchronously run matching logic
        # For production, this could be backgrounded if it's too slow.
        matches = self.matching_service.find_matches_for_request(request_id)
        
        # 4. Update request with matches
        status = 'matched' if matches else 'pending'
        updated_request = self.repository.update(request_id, {
            "matches": matches,
            "status": status
        })
        
        return updated_request

    def list_requests(self, filter_query: dict = None) -> List[DonationRequest]:
        return self.repository.get_multi(filter_query=filter_query)

    def get_request_by_id(self, request_id: str) -> Optional[DonationRequest]:
        return self.repository.get(request_id)

    def volunteer_for_request(self, request_id: str, donor_user_id: str) -> DonationRequest:
        request = self.get_request_by_id(request_id)
        if not request:
            raise ValueError("Request not found")
            
        from repositories.donor_repository import DonorRepository
        donor = DonorRepository().get_by_user_id(donor_user_id)
        
        matches = request.matches or []
        # Check if already volunteered
        if not any(m.get('donor_id') == donor_user_id for m in matches):
            matches.append({
                "donor_id": donor_user_id,
                "blood_group": donor.blood_group if donor else "Unknown",
                "distance": "0 km", # Mock distance for explicit volunteer
                "score": 100,
                "availability": True
            })
            
        return self.repository.update(request_id, {
            "matches": matches,
            "status": "matched"
        })

    def accept_match(self, request_id: str, donor_id: str, recipient_id: str) -> DonationRequest:
        request = self.get_request_by_id(request_id)
        if not request:
            raise ValueError("Request not found")
            
        if request.user_id and request.user_id != recipient_id:
            raise ValueError("Unauthorized to accept this match")
            
        return self.repository.update(request_id, {
            "status": "fulfilled"
        })

    def decline_match(self, request_id: str, donor_id: str, recipient_id: str) -> DonationRequest:
        request = self.get_request_by_id(request_id)
        if not request:
            raise ValueError("Request not found")
            
        if request.user_id and request.user_id != recipient_id:
            raise ValueError("Unauthorized to decline this match")
            
        matches = request.matches or []
        # Remove the declined donor from matches
        matches = [m for m in matches if m.get('donor_id') != donor_id]
        
        status = request.status
        if not matches and status == 'matched':
            status = 'pending'
            
        return self.repository.update(request_id, {
            "matches": matches,
            "status": status
        })

    def cancel_request(self, request_id: str, user_id: str) -> DonationRequest:
        request = self.get_request_by_id(request_id)
        if not request:
            raise ValueError("Request not found")
        if request.user_id != user_id:
            raise ValueError("Unauthorized to cancel this request")
            
        return self.repository.update(request_id, {"status": "cancelled"})

