import { useEffect, useState } from 'react';
import api from '../api/axios';

const MemberMeetings = () => {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const loadMeetings = async () => {
    try {
      const { data } = await api.get('/meetings');
      setMeetings(data.meetings || []);
    } catch (error) {
      console.error('Failed to load meetings:', error);

      setMessage(
        error.response?.data?.message ||
        'Failed to load meetings'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMeetings();
  }, []);

  if (loading) {
    return (
      <div className="page-container">
        <h2>My Meetings</h2>
        <p>Loading meetings...</p>
      </div>
    );
  }

  return (
    <div className="page-container">

      <h2>My Meetings</h2>

      {message && (
        <div className="card">
          <p>{message}</p>
        </div>
      )}

      {meetings.length === 0 ? (
        <div className="card">
          <h3>No Meetings Yet</h3>
          <p>
            Your SHG head has not scheduled any meetings yet.
          </p>
        </div>
      ) : (
        <div className="meeting-list">

          {meetings.map((meeting) => (

            <div
              className="card meeting-card"
              key={meeting._id}
            >

              <h3>
                {new Date(meeting.date).toLocaleDateString()}
              </h3>

              <p>
                <strong>Type:</strong>{' '}
                {meeting.type}
              </p>

              <p>
                <strong>Status:</strong>{' '}
                {meeting.status}
              </p>

              <p>
                <strong>Agenda:</strong>
              </p>

              <p>
                {meeting.agenda || 'No agenda provided'}
              </p>

              {meeting.notes && (
                <>
                  <p>
                    <strong>Notes:</strong>
                  </p>

                  <p>{meeting.notes}</p>
                </>
              )}

            </div>

          ))}

        </div>
      )}

    </div>
  );
};

export default MemberMeetings;