import { useState } from 'react';
import AddEventForm from './AddEventForm';

export default function EventsList({ events, onEdit, onDelete, onAddParticipant, onRemoveParticipant }) {
  const [editingEvent, setEditingEvent] = useState(null);

  return (
    <div>
      {events.length === 0 ? (
        <p>No events yet. Add the first one!</p>
      ) : (
        events.map(ev => (
          <div key={ev.id} style={{ border: "1px solid var(--border)", borderRadius: 12, padding: 12, marginBottom: 16 }}>
            <h3>{ev.title}</h3>
            <div><strong>Date:</strong> {ev.date}</div>
            <div><strong>Location:</strong> {ev.location || 'N/A'}</div>
            <div><strong>Description:</strong> {ev.description || 'N/A'}</div>

            <h4>Participants</h4>
            {ev.participants && ev.participants.length ? (
              <ul>
                {ev.participants.map(p => (
                  <li key={p.id}>
                    {p.name} ({p.email}){' '}
                    <button
                      onClick={() => onRemoveParticipant(ev.id, p.id)}
                      style={{ color: 'var(--error)', background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No participants yet.</p>
            )}

            <button onClick={() => setEditingEvent(ev)} style={{ marginRight: 8 }}>
              Edit Event
            </button>
            <button onClick={() => onDelete(ev.id)} style={{ color: 'var(--error)' }}>
              Delete Event
            </button>

            {editingEvent && editingEvent.id === ev.id && (
              <div style={{ marginTop: 16 }}>
                <AddEventForm
                  initial={editingEvent}
                  onSubmit={(updates) => {
                    onEdit(ev.id, updates);
                    setEditingEvent(null);
                  }}
                />
                <button onClick={() => setEditingEvent(null)} style={{ marginTop: 8 }}>
                  Cancel
                </button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
