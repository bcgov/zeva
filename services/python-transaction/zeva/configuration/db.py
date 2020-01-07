import os

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

DB = {
    'url': os.getenv('DATABASE_URL')
}

engine = create_engine(DB['url'], echo=True)
Session = sessionmaker(bind=engine)


def get_session():
    """Create an SQLAlchemy session"""
    return Session()
