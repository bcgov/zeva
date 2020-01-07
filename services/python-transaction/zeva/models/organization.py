from sqlalchemy import Column, Integer, String, BigInteger, Numeric, ForeignKey

from models.base import Base


class Organization(Base):

    __tablename__ = 'organizations'

    id = Column(BigInteger, primary_key=True)
    name = Column(String, unique=True, nullable=False)
