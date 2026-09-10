from pwdlib import PasswordHash

password_hash = PasswordHash.recommended()

def verify_password(plain_password: str, stored_hash: str) -> bool:
    return password_hash.verify(plain_password, stored_hash)

def hash_password(plain_password: str) -> str:
    return password_hash.hash(plain_password)
