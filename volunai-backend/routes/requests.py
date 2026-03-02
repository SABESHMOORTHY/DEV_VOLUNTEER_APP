"""
Assistance Request API — matches the Java AssistanceRequestController endpoints.
When a request is created, the ML matching engine automatically suggests volunteers.
"""
from flask import Blueprint, request as flask_request, jsonify
from models import db, AssistanceRequest, Volunteer
from ml.matching_engine import matching_engine

bp = Blueprint("requests", __name__, url_prefix="/api/requests")


@bp.route("", methods=["POST"])
def create_request():
    data = flask_request.get_json()
    req = AssistanceRequest(
        requester_name=data["requesterName"],
        requester_contact=data["requesterContact"],
        location=data["location"],
        service_type=data["serviceType"],
        description=data.get("description", ""),
        urgency_level=data.get("urgencyLevel", "MEDIUM"),
        status="PENDING",
    )
    db.session.add(req)
    db.session.commit()

    # --- ML: get top 3 volunteer matches ---
    volunteers = Volunteer.query.filter_by(active=True).all()
    vol_dicts = [v.to_dict() for v in volunteers]
    matches = matching_engine.rank_volunteers(req.to_dict(), vol_dicts, limit=3)

    return jsonify({
        "request": req.to_dict(),
        "suggestedVolunteers": matches,
    }), 201


@bp.route("", methods=["GET"])
def get_all_requests():
    reqs = AssistanceRequest.query.all()
    return jsonify([r.to_dict() for r in reqs])


@bp.route("/<int:rid>", methods=["GET"])
def get_request(rid):
    r = AssistanceRequest.query.get_or_404(rid)
    return jsonify(r.to_dict())


@bp.route("/<int:rid>/status", methods=["PATCH"])
def update_status(rid):
    r = AssistanceRequest.query.get_or_404(rid)
    data = flask_request.get_json()
    r.status = data.get("status", r.status)
    db.session.commit()
    return jsonify(r.to_dict())


@bp.route("/<int:request_id>/assign/<int:volunteer_id>", methods=["POST"])
def assign_volunteer(request_id, volunteer_id):
    r = AssistanceRequest.query.get_or_404(request_id)
    v = Volunteer.query.get_or_404(volunteer_id)
    if not v.active:
        return jsonify({"error": "Cannot assign inactive volunteer"}), 400
    r.assigned_volunteer_id = volunteer_id
    r.status = "ASSIGNED"
    db.session.commit()
    return jsonify(r.to_dict())


@bp.route("/<int:rid>", methods=["DELETE"])
def delete_request(rid):
    r = AssistanceRequest.query.get_or_404(rid)
    db.session.delete(r)
    db.session.commit()
    return "", 204


@bp.route("/status/<status>", methods=["GET"])
def get_by_status(status):
    reqs = AssistanceRequest.query.filter_by(status=status.upper()).all()
    return jsonify([r.to_dict() for r in reqs])
