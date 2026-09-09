import { useEffect, useState } from 'react';
import api from '../api/axios';
import { Link } from 'react-router-dom';
const Meetings = () => {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    date: '',
    type: 'monthly',
    agenda: '',
  });

  const [message, setMessage] = useState('');

  const loadMeetings = async () => {
    try {
      const { data } = await api.get('/meetings');
      setMeetings(data.meetings || []);
    } catch (error) {
      console.error('Failed to load meetings:', error);
      setMessage(
        error.response?.data?.message || 'Failed to load meetings'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMeetings();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const createMeeting = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      await api.post('/meetings', form);

      setMessage('Meeting created successfully!');

      setForm({
        date: '',
        type: 'monthly',
        agenda: '',
      });

      loadMeetings();
    } catch (error) {
      console.error('Create meeting error:', error);

      setMessage(
        error.response?.data?.message ||
          'Failed to create meeting'
      );
    }
  };

  const completeMeeting = async (id) => {
    try {
      await api.put(`/meetings/${id}/complete`);

      setMessage('Meeting marked as completed.');

      loadMeetings();
    } catch (error) {
      console.error('Complete meeting error:', error);

      setMessage(
        error.response?.data?.message ||
          'Failed to complete meeting'
      );
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <h2>Meetings</h2>
        <p>Loading meetings...</p>
      </div>
    );
  }

  return (
    <div className="page-container">

      <h2>Meeting Management</h2>

      {/* Create Meeting */}

      <div className="card">

        <h3>Create New Meeting</h3>

        <form onSubmit={createMeeting}>

          <div className="form-group">
            <label>Meeting Date</label>

            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Meeting Type</label>

            <select
              name="type"
              value={form.type}
              onChange={handleChange}
            >
              <option value="monthly">
                Monthly Meeting
              </option>

              <option value="special">
                Special Meeting
              </option>

              <option value="emergency">
                Emergency Meeting
              </option>
            </select>
          </div>

          <div className="form-group">
            <label>Agenda</label>

            <textarea
              name="agenda"
              value={form.agenda}
              onChange={handleChange}
              placeholder="Enter meeting agenda"
              rows="4"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
          >
            Create Meeting
          </button>

        </form>

        {message && (
          <p className="form-message">
            {message}
          </p>
        )}

      </div>


      {/* Meeting History */}

      <div className="card">

        <h3>Meeting History</h3>

        {meetings.length === 0 ? (

          <p>No meetings created yet.</p>

        ) : (

          <div className="meeting-list">

            {meetings.map((meeting) => (

              <div
                className="meeting-card"
                key={meeting._id}
              >

                <h4>
                  {new Date(meeting.date).toLocaleDateString()}
                </h4>

                <p>
                  <strong>Type:</strong>{' '}
                  {meeting.type}
                </p>

                <p>
                  <strong>Agenda:</strong>{' '}
                  {meeting.agenda || 'No agenda provided'}
                </p>

                <p>
                  <strong>Status:</strong>{' '}
                  {meeting.status}
                </p>
                <Link
  to={`/meetings/${meeting._id}/attendance`}
  className="btn btn-primary"
>
  Mark Attendance
</Link>
<Link
  to={`/meetings/${meeting._id}/attendance`}
  className="btn btn-primary"
>
  Mark Attendance
</Link>
                {meeting.status === 'scheduled' && (
                  <button
                    className="btn btn-secondary"
                    onClick={() =>
                      completeMeeting(meeting._id)
                    }
                  >
                    Mark Completed
                  </button>
                )}

              </div>

            ))}

          </div>

        )}

      </div>

    </div>
  );
};

export default Meetings;