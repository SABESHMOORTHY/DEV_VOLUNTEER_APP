"""
SQLAlchemy database models for VolunAI.
Mirrors the existing Java/JPA entities so the React frontend works unchanged.
"""
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import json

db = SQLAlchemy()


class Volunteer(db.Model):
    __tablename__ = "volunteers"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    phone = db.Column(db.String(30), nullable=True)
    location = db.Column(db.String(120), nullable=True)
    available_days = db.Column(db.Text, default="[]")   # JSON array
    service_type = db.Column(db.Text, default="[]")      # JSON array
    rating = db.Column(db.Float, default=0.0)
    active = db.Column(db.Boolean, default=True)

    # ----- helpers to serialise / deserialise JSON list columns -----
    def get_available_days(self):
        try:
            return json.loads(self.available_days) if self.available_days else []
        except (json.JSONDecodeError, TypeError):
            return []

    def set_available_days(self, days_list):
        self.available_days = json.dumps(days_list)

    def get_service_types(self):
        try:
            return json.loads(self.service_type) if self.service_type else []
        except (json.JSONDecodeError, TypeError):
            return []

    def set_service_types(self, types_list):
        self.service_type = json.dumps(types_list)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "phone": self.phone,
            "location": self.location,
            "availableDays": self.get_available_days(),
            "serviceType": self.get_service_types(),
            "rating": self.rating,
            "active": self.active,
        }


class AssistanceRequest(db.Model):
    __tablename__ = "assistance_requests"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    requester_name = db.Column(db.String(120), nullable=False)
    requester_contact = db.Column(db.String(120), nullable=False)
    location = db.Column(db.String(120), nullable=False)
    service_type = db.Column(db.String(120), nullable=False)
    description = db.Column(db.Text, nullable=True)
    urgency_level = db.Column(db.String(20), nullable=False, default="MEDIUM")
    status = db.Column(db.String(20), nullable=False, default="PENDING")
    assigned_volunteer_id = db.Column(db.Integer, db.ForeignKey("volunteers.id"), nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "requesterName": self.requester_name,
            "requesterContact": self.requester_contact,
            "location": self.location,
            "serviceType": self.service_type,
            "description": self.description,
            "urgencyLevel": self.urgency_level,
            "status": self.status,
            "assignedVolunteerId": self.assigned_volunteer_id,
        }


class Assignment(db.Model):
    __tablename__ = "assignments"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    request_id = db.Column(db.Integer, db.ForeignKey("assistance_requests.id"), nullable=False)
    volunteer_id = db.Column(db.Integer, db.ForeignKey("volunteers.id"), nullable=False)
    match_score = db.Column(db.Float, default=0.0)
    acceptance_probability = db.Column(db.Float, default=0.0)
    status = db.Column(db.String(20), default="SUGGESTED")
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "requestId": self.request_id,
            "volunteerId": self.volunteer_id,
            "matchScore": self.match_score,
            "acceptanceProbability": self.acceptance_probability,
            "status": self.status,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None,
        }
