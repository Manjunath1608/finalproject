import sys
sys.path.insert(0, 'backend')
import database
from core.db_instance import get_collection
from services.request_service import RequestService

database.init_db()

service = RequestService()
request_id = '6a0985658a52bf50968a5732' # Picked a matched one
user_id = '69eb4c2f6da480a252f71af5' # Matching the UserID from DB

try:
    print(f"Cancelling {request_id} for user {user_id}")
    res = service.cancel_request(request_id, user_id)
    print("Success:", res)
except Exception as e:
    print("Error:", repr(e))
