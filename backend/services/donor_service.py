from typing import List, Optional
from models.donor_schema import DonorModel
from repositories.donor_repository import DonorRepository

from services.blockchain_service import BlockchainService

class DonorService:
    def __init__(self):
        self.repository = DonorRepository()
        self.blockchain_service = BlockchainService()

    def create_donor(self, donor: DonorModel) -> DonorModel:
        # 1. Business Logic: Validate age/eligibility
        # 2. Save to DB
        created_donor = self.repository.create(donor)
        
        # 3. Log to Blockchain
        try:
            self.blockchain_service.log_donor_registration(
                donor_id=str(created_donor.id),
                donor_name=f"{created_donor.first_name} {created_donor.last_name}",
                blood_group=created_donor.blood_group
            )
        except Exception:
            # Don't fail the request if blockchain logging fails, but maybe log error
            pass
        
        return created_donor

    def get_all_donors(self) -> List[DonorModel]:
        return self.repository.get_multi()

    def get_donor_by_id(self, donor_id: str) -> Optional[DonorModel]:
        return self.repository.get(donor_id)
        
    def get_donor_profile(self, user_id: str) -> Optional[DonorModel]:
        return self.repository.get_by_user_id(user_id)
        
    def update_donor_profile(self, user_id: str, update_data: dict) -> Optional[DonorModel]:
        donor = self.repository.get_by_user_id(user_id)
        if not donor:
            return None
        return self.repository.update(donor.id, update_data)

    def get_donation_history(self, user_id: str) -> List[dict]:
        # Returns logic for matching requests
        # Filter requests where status is 'MATCHED' and matched_donor_id == donor.id
        # This requires RequestRepository or access to requests collection. 
        # Ideally, we should inject RequestService or Repo.
        # For now, simplistic approximation or placeholder.
        return []
