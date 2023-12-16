import os
from dotenv import load_dotenv
load_dotenv()

with open(os.environ['POSTGRES_USER_FILE']) as f:
    _db_user = f.read()

with open(os.environ['POSTGRES_PASSWORD_FILE']) as f:
    _db_pass = f.read()


class BaseConfig(object):
    CSRF_ENABLED = True
    SECRET_KEY = "77tgFCdrEEdv77554##@3"
    DEBUG = os.environ['DEBUG']
    DB_NAME = os.environ['POSTGRES_DB']
    DB_USER = _db_user
    DB_PASS = _db_pass
    DB_PORT = os.environ['DATABASE_PORT']
    DB_HOST = 'postgres'
    try:
        if os.environ['ENV_NAME'] == 'LOCAL':
            DB_HOST = 'localhost'
    except:
        pass
    SQLALCHEMY_DATABASE_URI = f'postgresql://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}'


pass
