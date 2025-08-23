import { useState } from 'react';

export default function AddEventForm({ onSubmit, initial }) {
  const [title, setTitle] = useState(initial?.title || '');
  const [date, setDate] = useState(initial?.date || '');
  const [location, setLocation] = useState(initial?.location || '');
  const [description, setDescription] = useState(initial?.description || '');
  const [participants, setParticipants] = useState(initial?.participants || []);

  const [participantName, setParticipantName] = useState('');
  const [participantEmail, setParticipantEmail] = useState('');

  const addParticipant = () => {
    if (participantName.trim() && participantEmail.trim()) {
      setParticipants(prev => [
        ...prev,
        { id: Date.now(), name: participantName.trim(), email: participantEmail.trim() }
      ]);
      setParticipantName('');
      setParticipantEmail('');
    }
  };

  const removeParticipant = (id) => {
    setParticipants(prev => prev.filter(p => p.id !== id));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ title, date, location, description, participants });
    if (!initial) {
      setTitle('');
      setDate('');
      setLocation('');
      setDescription('');
      setParticipants([]);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form">
      <div className="field">
        <label>Event Title</label>
        <input value={title} onChange={e => setTitle(e.target.value)} required />
      </div>
      <div className="field">
        <label>Date (YYYY-MM-DD)</label>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} required />
      </div>
      <div className="field">
        <label>Location</label>
        <input value={location} onChange={e => setLocation(e.target.value)} />
      </div>
      <div className="field">
        <label>Description</label>
        <input value={description} onChange={e => setDescription(e.target.value)} />
      </div>

      <fieldset style={{ marginTop: '1rem', border: '1px solid var(--border)', padding: '10px', borderRadius: '8px' }}>
        <legend>Participants</legend>

        {participants.length === 0 && <p>No participants added yet.</p>}
        <ul>
          {participants.map(p => (
            <li key={p.id}>
              {p.name} ({p.email}){' '}
              <button type="button" onClick={() => removeParticipant(p.id)} style={{color: 'var(--error)', background: 'none', border: 'none', cursor: 'pointer'}}>
                Remove
              </button>
            </li>
          ))}
        </ul>

        <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
          <input
            placeholder="Participant Name"
            value={participantName}
            onChange={e => setParticipantName(e.target.value)}
          />
          <input
            type="email"
            placeholder="Participant Email"
            value={participantEmail}
            onChange={e => setParticipantEmail(e.target.value)}
          />
          <button type="button" onClick={addParticipant} disabled={!participantName || !participantEmail}>
            Add Participant
          </button>
        </div>
      </fieldset>

      <button type="submit" style={{ marginTop: '16px' }}>
        {initial ? 'Update Event' : 'Add Event'}
      </button>
    </form>
  );
}
