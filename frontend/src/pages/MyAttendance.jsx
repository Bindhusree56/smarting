import { useEffect, useState } from 'react';
import api from '../api/axios';

const MyAttendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadAttendance = async () => {
    try {
      const { data } = await api.get('/attendance/my');

      setAttendance(data.attendance || []);
    } catch (error) {
      console.error('Failed to load attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttendance();
  }, []);

  if (loading) {
    return (
      <div className="page-container">
        <h2>My Attendance</h2>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="page-container">

      <h2>My Attendance</h2>

      {attendance.length === 0 ? (

        <div className="card">
          <p>No attendance records found.</p>
        </div>

      ) : (

        attendance.map((record) => (

          <div
            className="card"
            key={record._id}
          >

            <h3>
              {record.meeting
                ? new Date(
                    record.meeting.date
                  ).toLocaleDateString()
                : 'Meeting'}
            </h3>

            <p>
              <strong>Status:</strong>{' '}
              {record.status}
            </p>

            <p>
              <strong>Fine:</strong>{' '}
              ₹{record.fineAmount || 0}
            </p>

            <p>
              <strong>Fine Status:</strong>{' '}
              {record.fineStatus || 'Not Applicable'}
            </p>

          </div>

        ))

      )}

    </div>
  );
};

export default MyAttendance;