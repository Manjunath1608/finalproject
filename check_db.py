import sys
sys.path.insert(0, 'backend')
import database
from core.db_instance import get_collection

database.init_db()
requests = list(get_collection('requests').find())
for r in requests:
    print(f"ID: {r['_id']}, UserID: {r.get('user_id')}, Status: {r.get('status')}")
