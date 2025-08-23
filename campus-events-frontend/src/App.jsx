import { useState, useEffect, useCallback } from 'react';
import { getEvents, addEvent, updateEvent, deleteEvent, addParticipant, removeParticipant } from './api';
import EventsList from './components/EventsList';
import AddEventForm from './components/AddEventForm';
import LoadingError from './components/LoadingError';

export default function App() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getEvents();
      setEvents(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const handleAddEvent = async (eventData) => {
    try {
      const res = await addEvent(eventData);
      setEvents(prev => [...prev, res.event]);
    } catch (e) {
      alert('Failed to add event: ' + e.message);
    }
  };

  const handleEditEvent = async (id, updates) => {
    try {
      const res = await updateEvent(id, updates);
      setEvents(prev => prev.map(ev => (ev.id === id ? res.event : ev)));
    } catch (e) {
      alert('Failed to edit event: ' + e.message);
    }
  };

  const handleDeleteEvent = async (id) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    try {
      await deleteEvent(id);
      setEvents(prev => prev.filter(ev => ev.id !== id));
    } catch (e) {
      alert('Failed to delete event: ' + e.message);
    }
  };

  const handleAddParticipant = async (eventId, participant) => {
    try {
      const res = await addParticipant(eventId, participant);
      setEvents(prev =>
        prev.map(ev =>
          ev.id === eventId ? { ...ev, participants: [...(ev.participants || []), res.participant] } : ev
        )
      );
    } catch (e) {
      alert('Failed to add participant: ' + e.message);
    }
  };

  const handleRemoveParticipant = async (eventId, participantId) => {
    try {
      await removeParticipant(eventId, participantId);
      setEvents(prev =>
        prev.map(ev =>
          ev.id === eventId
            ? { ...ev, participants: (ev.participants || []).filter(p => p.id !== participantId) }
            : ev
        )
      );
    } catch (e) {
      alert('Failed to remove participant: ' + e.message);
    }
  };

  return (
    <div className="container">
      <header>
        <h1>Campus Events</h1>
        <p className="subtitle">React ↔ Flask API Integration</p>
      </header>

      <section className="card">
        <h2>Add New Event</h2>
        <AddEventForm onSubmit={handleAddEvent} />
      </section>

      <section className="card">
        <h2>Events</h2>
        <LoadingError loading={loading} error={error} onRetry={loadEvents} />
        {!loading && !error && (
          <EventsList
            events={events}
            onEdit={handleEditEvent}
            onDelete={handleDeleteEvent}
            onAddParticipant={handleAddParticipant}
            onRemoveParticipant={handleRemoveParticipant}
          />
        )}
      </section>

      <footer>
        <small>API Base: {import.meta.env.VITE_API_BASE_URL}</small>
      </footer>
    </div>
  );
}
