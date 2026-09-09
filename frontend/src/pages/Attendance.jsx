import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';

const Attendance = () => {
  const { meetingId } = useParams();

  const [meeting, setMeeting] = useState(null);
  const [members, setMembers] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [finePerAbsence, setFinePerAbsence] = useState('50');

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const loadData = async () => {
    try {
      const meetingResponse = await api.get(
        `/meetings/${meetingId}`
      );

      setMeeting(meetingResponse.data.meeting);

      const membersResponse = await api.get('/members');

      setMembers(membersResponse.data.members || []);

      // Default everyone to present
      const initialAttendance = {};

      (membersResponse.data.members || []).forEach((member) => {
        initialAttendance[member._id] = 'present';
      });

      setAttendance(initialAttendance);

    } catch (error) {
      console.error('Failed to load attendance data:', error);

      setMessage(
        error.response?.data?.message ||
        'Failed to load attendance'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [meetingId]);

  const handleAttendanceChange = (memberId, status) => {
    setAttendance((prev) => ({
      ...prev,
      [memberId]: status,
    }));
  };

  const saveAttendance = async () => {
    setMessage('');

    try {
      const attendanceData = members.map((member) => ({
        memberId: member._id,
        status: attendance[member._id] || 'present',
      }));

      await api.post('/attendance', {
        meetingId,
        attendance: attendanceData,
        finePerAbsence: Number(finePerAbsence),
      });

      setMessage(
        'Attendance saved successfully. Fines were generated automatically for absentees.'
      );

    } catch (error) {
      console.error('Save attendance error:', error);

      setMessage(
        error.response?.data?.message ||
        'Failed to save attendance'
      );
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <h2>Mark Attendance</h2>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="page-container">

      <h2>Mark Attendance</h2>

      {meeting && (
        <div className="card">

          <h3>
            {new Date(meeting.date).toLocaleDateString()}
          </h3>

          <p>
            <strong>Type:</strong> {meeting.type}
          </p>

          <p>
            <strong>Agenda:</strong>{' '}
            {meeting.agenda || 'No agenda'}
          </p>

        </div>
      )}

      <div className="card">

        <div className="form-group">

          <label>
            Fine for Absence (₹)
          </label>

          <input
            type="number"
            min="0"
            value={finePerAbsence}
            onChange={(e) =>
              setFinePerAbsence(e.target.value)
            }
          />

        </div>

      </div>

      <div className="card">

        <h3>Members Attendance</h3>

        {members.length === 0 ? (

          <p>No active members found.</p>

        ) : (

          <div>

            {members.map((member) => (

              <div
                key={member._id}
                className="attendance-row"
              >

                <div>
                  <strong>{member.name}</strong>

                  <p>{member.mobile}</p>
                </div>

                <div>

                  <label>
                    <input
                      type="radio"
                      name={`attendance-${member._id}`}
                      checked={
                        attendance[member._id] === 'present'
                      }
                      onChange={() =>
                        handleAttendanceChange(
                          member._id,
                          'present'
                        )
                      }
                    />

                    Present
                  </label>

                  <label>
                    <input
                      type="radio"
                      name={`attendance-${member._id}`}
                      checked={
                        attendance[member._id] === 'absent'
                      }
                      onChange={() =>
                        handleAttendanceChange(
                          member._id,
                          'absent'
                        )
                      }
                    />

                    Absent
                  </label>

                </div>

              </div>

            ))}

          </div>

        )}

      </div>

      <button
        className="btn btn-primary"
        onClick={saveAttendance}
      >
        Save Attendance
      </button>

      {message && (
        <div className="card">
          <p>{message}</p>
        </div>
      )}

    </div>
  );
};

export default Attendance;