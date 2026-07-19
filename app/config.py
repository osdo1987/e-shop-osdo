import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'e-shop-dev-key-123')
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', 'postgresql://postgres:postgres@localhost:5432/e_shop')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'jwt-secret-key-change-me')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)
    DEBUG = True
    
    # Mail Config
    MAIL_SERVER = os.getenv('MAIL_SERVER', 'smtp.gmail.com')
    MAIL_PORT = int(os.getenv('MAIL_PORT', 587))
    MAIL_USE_TLS = os.getenv('MAIL_USE_TLS', 'True').lower() in ['true', '1', 't']
    MAIL_USERNAME = os.getenv('MAIL_USERNAME')
    MAIL_PASSWORD = os.getenv('MAIL_PASSWORD')
    MAIL_DEFAULT_SENDER = os.getenv('MAIL_DEFAULT_SENDER')
    FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://localhost:5173')

    # Image Config
    UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'uploads')
    MAX_IMAGE_SIZE = 5 * 1024 * 1024  # 5MB
    ALLOWED_IMAGE_MIMES = {'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'}
    ALLOWED_IMAGE_EXTENSIONS = {'jpg', 'jpeg', 'png', 'webp', 'gif', 'avif'}