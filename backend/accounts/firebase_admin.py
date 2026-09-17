import os
import firebase_admin
from firebase_admin import credentials, auth
from django.conf import settings

def initialize_firebase_admin():
    """
    Initializes the Firebase Admin SDK if it hasn't been initialized yet.
    Safe against multiple calls.
    """
    if not firebase_admin._apps:
        cred_path = os.environ.get('FIREBASE_SERVICE_ACCOUNT_PATH')
        
        if cred_path and not os.path.isabs(cred_path):
            cred_path = os.path.join(settings.BASE_DIR, cred_path)
            
        if cred_path and os.path.exists(cred_path):
            cred = credentials.Certificate(cred_path)
            firebase_admin.initialize_app(cred)
        else:
            print("WARNING: Firebase Admin SDK credentials not found. Google login will fail.")

# Auto-initialize on import
initialize_firebase_admin()

def verify_firebase_token(id_token):
    """
    Verifies a Firebase ID token and returns the decoded token payload.
    """
    if not firebase_admin._apps:
        initialize_firebase_admin()
        
    try:
        decoded_token = auth.verify_id_token(id_token)
        return decoded_token
    except Exception as e:
        raise ValueError(f"Invalid Firebase ID token: {str(e)}")
