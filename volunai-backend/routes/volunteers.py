"""
Volunteer CRUD API — matches the Java VolunteerController endpoints.
"""
from flask import Blueprint, request, jsonify
from models import db, Volunteer

bp = Blueprint("volunteers", __name__, url_prefix="/api/volunteers")


@bp.route("", methods=["POST"])
def create_volunteer():
    data = request.get_json()
    v = Volunteer(
        name=data["name"],
        email=data["email"],
        phone=data.get("phone"),
        location=data.get("location"),
        rating=data.get("rating", 0.0),
        active=data.get("active", True),
    )
    v.set_available_days(data.get("availableDays", []))
    v.set_service_types(data.get("serviceType", []))
    db.session.add(v)
    db.session.commit()
    return jsonify(v.to_dict()), 201


@bp.route("", methods=["GET"])
def get_all_volunteers():
    volunteers = Volunteer.query.all()
    return jsonify([v.to_dict() for v in volunteers])


@bp.route("/<int:vid>", methods=["GET"])
def get_volunteer(vid):
    v = Volunteer.query.get_or_404(vid)
    return jsonify(v.to_dict())


@bp.route("/<int:vid>", methods=["PUT"])
def update_volunteer(vid):
    v = Volunteer.query.get_or_404(vid)
    data = request.get_json()
    v.name = data.get("name", v.name)
    v.email = data.get("email", v.email)
    v.phone = data.get("phone", v.phone)
    v.location = data.get("location", v.location)
    v.rating = data.get("rating", v.rating)
    v.active = data.get("active", v.active)
    if "availableDays" in data:
        v.set_available_days(data["availableDays"])
    if "serviceType" in data:
        v.set_service_types(data["serviceType"])
    db.session.commit()
    return jsonify(v.to_dict())


@bp.route("/<int:vid>", methods=["DELETE"])
def delete_volunteer(vid):
    v = Volunteer.query.get_or_404(vid)
    db.session.delete(v)
    db.session.commit()
    return "", 204


@bp.route("/active", methods=["GET"])
def get_active_volunteers():
    volunteers = Volunteer.query.filter_by(active=True).all()
    return jsonify([v.to_dict() for v in volunteers])
