from sqlalchemy import Column, Integer, String, Date, ForeignKey
from sqlalchemy.orm import relationship
from app.database.db import Base

class User(Base):
    __tablename__ = "user"
    cpf = Column(String(14), primary_key=True)
    name = Column(String(100), nullable=False)
    phone = Column(String(15), unique=True, nullable=False, index=True)
    birth_date = Column(Date, nullable=False)

    reports = relationship("Report", back_populates="user")


class Neighborhood(Base):
    __tablename__ = "neighborhood"
    neighborhood_id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), unique=True, nullable=False, index=True)

    reports = relationship("Report", back_populates="neighborhood")


class Occurrence(Base):
    __tablename__ = "occurrence"
    occurrence_id = Column(Integer, primary_key=True, autoincrement=True)
    occurrence_name = Column(String(100), unique=True, nullable=False, index=True)

    reports = relationship("Report", back_populates="occurrence")


class Report(Base):
    __tablename__ = "report"
    request_number = Column(Integer, primary_key=True, autoincrement=True)
    problem_id = Column(String(100), nullable=False)
    problem_description = Column(String, nullable=True)
    image_url = Column(String(255), nullable=True)
    neighborhood_id = Column(Integer, ForeignKey("neighborhood.neighborhood_id"), nullable=False)
    address = Column(String(255), nullable=True)
    status = Column(String(50), nullable=False)
    date = Column(Date, nullable=False)
    user_phone = Column(String(15), ForeignKey("user.phone"), nullable=False)
    occurrence_id = Column(Integer, ForeignKey("occurrence.occurrence_id"), nullable=False)

    user = relationship("User", back_populates="reports")
    neighborhood = relationship("Neighborhood", back_populates="reports")
    occurrence = relationship("Occurrence", back_populates="reports")
