from sqlalchemy import Column, Integer, String, BigInteger, Numeric, ForeignKey
from sqlalchemy.orm import relationship

from models.base import Base

class User(Base):
    __tablename__ = 'users'

    username = Column(String, primary_key=True, unique=True, nullable=False)
    organization_id = Column(ForeignKey("organizations.id"), nullable=False)
    organization = relationship("Organization", foreign_keys=[organization_id])


