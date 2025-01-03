
from jose import jwt
from datetime import datetime, timedelta
from argon2 import PasswordHasher, exceptions
import secrets

class SecurityManager:
    def __init__(self, secret_key=secrets.token_hex(32)):
        self.secret_key = secret_key
        self.request_counts = {}
        self.rate_limit = 100  # requests per minute
        self.totp_secrets = {}  # for 2FA
        self.failed_attempts = {}
        self.lockout_threshold = 5
        self.lockout_duration = 300  # 5 minutes
        
    def generate_totp_secret(self, user_id):
        """Generate TOTP secret for 2FA"""
        secret = secrets.token_hex(20)
        self.totp_secrets[user_id] = secret
        return secret
        
    def verify_totp(self, user_id, token):
        """Verify TOTP token"""
        import pyotp
        if user_id not in self.totp_secrets:
            return False
        totp = pyotp.TOTP(self.totp_secrets[user_id])
        return totp.verify(token)
        
    def check_rate_limit(self, user_id, endpoint=None):
        """Enhanced rate limiting with endpoint-specific limits"""
        now = datetime.utcnow()
        key = f"{user_id}:{endpoint}" if endpoint else user_id
        
        if key not in self.request_counts:
            self.request_counts[key] = []
            
        # Custom limits for specific endpoints
        limit = self.get_endpoint_limit(endpoint)
        
        # Remove old requests
        self.request_counts[user_id] = [
            ts for ts in self.request_counts[user_id]
            if (now - ts).seconds < 60
        ]
        
        if len(self.request_counts[user_id]) >= self.rate_limit:
            return False
            
        self.request_counts[user_id].append(now)
        return True

    def create_token(self, user_id):
        expiration = datetime.utcnow() + timedelta(hours=24)
        return jwt.encode(
            {'user_id': user_id, 'exp': expiration},
            self.secret_key,
            algorithm='HS256'
        )

    def verify_token(self, token):
    try:
        payload = jwt.decode(token, self.secret_key, algorithms=['HS256'])
        self.log_access(payload['user_id'], 'token_verification')
        return payload
    except Exception as e:
        self.log_access(None, 'token_verification_failed', str(e))
        return None

def log_access(self, user_id, action, details=None):
    timestamp = datetime.utcnow().isoformat()
    log_entry = {
        'timestamp': timestamp,
        'user_id': user_id,
        'action': action,
        'details': details,
        'ip_address': request.remote_addr if request else None
    }
    with open('audit_log.jsonl', 'a') as f:
        f.write(json.dumps(log_entry) + '\n')

def check_permission(self, user_id, required_role):
    user_roles = self.get_user_roles(user_id)
    return required_role in user_roles

def get_user_roles(self, user_id):
    roles = {
        'admin': ['admin', 'manager', 'user'],
        'manager': ['manager', 'user'],
        'user': ['user']
    }
    
    permissions = {
        'admin': ['read', 'write', 'delete', 'manage_users'],
        'manager': ['read', 'write', 'manage_tasks'],
        'user': ['read', 'write_own']
    }
    
    user_role = self.get_user_role_from_db(user_id)
    return roles.get(user_role, ['user']), permissions.get(user_role, [])

    def hash_password(self, password):
        ph = PasswordHasher()
        return ph.hash(password)
    
    def verify_password(self, password, hashed_password):
        ph = PasswordHasher()
        try:
            return ph.verify(hashed_password, password)
        except VerifyMismatchError:
            return False


    def check_permission(self, user_id, required_permission):
        user_roles, permissions = self.get_user_roles(user_id)
        return required_permission in permissions

    def log_access(self, user_id, action, details=None):
        timestamp = datetime.utcnow().isoformat()
        log_entry = {
            'timestamp': timestamp,
            'user_id': user_id,
            'action': action,
            'details': details
        }
        with open('audit_log.jsonl', 'a') as f:
            f.write(json.dumps(log_entry) + '\n')
