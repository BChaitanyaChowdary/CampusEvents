from flask import Flask, jsonify, request
from flask_cors import CORS
import re

app = Flask(__name__)
CORS(app)

# In-memory storage
events = [
    {
        "id": 1,
        "title": "Hackathon",
        "date": "2025-09-01",
        "description": "Annual coding hackathon",
        "location": "Auditorium",
        "participants": [
            {"id": 1, "name": "Alice", "email": "alice@example.com"},
            {"id": 2, "name": "Bob", "email": "bob@example.com"},
        ]
    },
    {
        "id": 2,
        "title": "Cultural Fest",
        "date": "2025-09-15",
        "description": "Festival with performances",
        "location": "Community Hall",
        "participants": []
    }
]

def find_event(event_id):
    return next((e for e in events if e["id"] == event_id), None)

def find_participant(event, participant_id):
    return next((p for p in event.get("participants", []) if p["id"] == participant_id), None)


@app.get("/health")
def health():
    return jsonify({"status": "ok"}), 200


@app.get("/events")
def get_events():
    return jsonify(events), 200


@app.get("/events/<int:event_id>")
def get_event(event_id):
    event = find_event(event_id)
    if not event:
        return jsonify({"status": "error", "message": "Event not found"}), 404
    return jsonify(event), 200


@app.post("/events")
def add_event():
    try:
        data = request.get_json(force=True) or {}
    except Exception:
        return jsonify({"status": "error", "message": "Invalid JSON"}), 400

    title = (data.get("title") or "").strip()
    date = (data.get("date") or "").strip()
    description = (data.get("description") or "").strip()
    location = (data.get("location") or "").strip()
    participants = data.get("participants", [])

    if not title or not date:
        return jsonify({"status": "error", "message": "title and date are required"}), 400

    if not re.match(r"^\d{4}-\d{2}-\d{2}$", date):
        return jsonify({"status": "error", "message": "date must be in YYYY-MM-DD format"}), 400

    clean_participants = []
    for i, p in enumerate(participants, start=1):
        name = p.get("name", "").strip()
        email = p.get("email", "").strip()
        if name and email:
            clean_participants.append({"id": i, "name": name, "email": email})

    new_id = max((e["id"] for e in events), default=0) + 1
    new_event = {
        "id": new_id,
        "title": title,
        "date": date,
        "description": description,
        "location": location,
        "participants": clean_participants
    }
    events.append(new_event)
    return jsonify({"status": "success", "event": new_event}), 201


@app.patch("/events/<int:event_id>")
def update_event(event_id):
    event = find_event(event_id)
    if not event:
        return jsonify({"status": "error", "message": "Event not found"}), 404

    try:
        data = request.get_json(force=True) or {}
    except Exception:
        return jsonify({"status": "error", "message": "Invalid JSON"}), 400

    title = data.get("title")
    date = data.get("date")
    description = data.get("description")
    location = data.get("location")

    if title is not None:
        event["title"] = title.strip()
    if date is not None:
        if not re.match(r"^\d{4}-\d{2}-\d{2}$", date.strip()):
            return jsonify({"status": "error", "message": "date must be in YYYY-MM-DD format"}), 400
        event["date"] = date.strip()
    if description is not None:
        event["description"] = description.strip()
    if location is not None:
        event["location"] = location.strip()

    return jsonify({"status": "success", "event": event}), 200


@app.delete("/events/<int:event_id>")
def delete_event(event_id):
    global events
    event = find_event(event_id)
    if not event:
        return jsonify({"status": "error", "message": "Event not found"}), 404
    events = [e for e in events if e["id"] != event_id]
    return jsonify({"status": "success"}), 200


@app.post("/events/<int:event_id>/participants")
def add_participant(event_id):
    event = find_event(event_id)
    if not event:
        return jsonify({"status": "error", "message": "Event not found"}), 404

    try:
        data = request.get_json(force=True) or {}
    except Exception:
        return jsonify({"status": "error", "message": "Invalid JSON"}), 400

    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip()

    if not name or not email:
        return jsonify({"status": "error", "message": "name and email are required"}), 400

    new_id = max((p["id"] for p in event.get("participants", [])), default=0) + 1
    participant = {"id": new_id, "name": name, "email": email}
    event.setdefault("participants", []).append(participant)

    return jsonify({"status": "success", "participant": participant}), 201


@app.delete("/events/<int:event_id>/participants/<int:participant_id>")
def remove_participant(event_id, participant_id):
    event = find_event(event_id)
    if not event:
        return jsonify({"status": "error", "message": "Event not found"}), 404

    participant = find_participant(event, participant_id)
    if not participant:
        return jsonify({"status": "error", "message": "Participant not found"}), 404

    event["participants"] = [p for p in event["participants"] if p["id"] != participant_id]
    return jsonify({"status": "success"}), 200


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
