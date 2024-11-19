import os

class Config:
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', 'postgresql://postgres:1234@localhost/mydb')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = os.getenv('SECRET_KEY', 'eb9eebeb4e6d7cbcf61d4d3c4c6ec5e17af0c249a7293a7251b84c6d391c4838')
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', '668d4a20d120dcee3cdca3c22cb1300616bdc2cd036cd89c21b9f2839812b986')
    JWT_ACCESS_TOKEN_EXPIRES = 43200