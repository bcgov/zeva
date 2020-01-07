from sqlalchemy import Column, Integer, String, BigInteger, Numeric, ForeignKey
from sqlalchemy.orm import relationship

from models.base import Base


class Vehicle(Base):

    __tablename__ = 'vehicles'

    id = Column(BigInteger, primary_key=True)
    organization_id = Column(ForeignKey("organizations.id"), nullable=False)
    organization = relationship("Organization", foreign_keys=[organization_id])

    make = Column(String, nullable=False)
    model = Column(String, nullable=False)
    type = Column(String, nullable=False)
    trim = Column(String, nullable=False)
    range = Column(Numeric, nullable=False)
    credits = Column(Integer, nullable=True)

