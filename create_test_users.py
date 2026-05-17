import sys
sys.path.insert(0, 'backend')

from services.auth_service import AuthService
from core.db_instance import get_collection
import database

# Initialize database
database.init_db()

# Create auth service
auth = AuthService()

# Create test users
users_to_create = [
    {"email": "admin@test.com", "password": "admin123", "role": "admin"},
    {"email": "donor@test.com", "password": "donor123", "role": "donor"},
    {"email": "hospital@test.com", "password": "hospital123", "role": "hospital"},
    {"email": "recipient@test.com", "password": "recipient123", "role": "recipient"},
]

u_coll = get_collection("users")

print("Creating test users...")
for user_data in users_to_create:
    # Check if user already exists
    existing = u_coll.find_one({"email": user_data["email"]})
    if existing:
        print(f"[OK] User {user_data['email']} already exists")
    else:
        u_coll.insert_one({
            "email": user_data["email"],
            "password_hash": auth.get_password_hash(user_data["password"]),
            "role": user_data["role"],
            "is_active": True
        })
        print(f"[OK] Created user: {user_data['email']} (password: {user_data['password']})")

print("\n" + "="*50)
print("TEST CREDENTIALS:")
print("="*50)
for user_data in users_to_create:
    print(f"Email: {user_data['email']:<25} Password: {user_data['password']}")
print("="*50)
