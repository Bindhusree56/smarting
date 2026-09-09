import { useEffect, useState } from 'react';
import api from '../api/axios';

const MyFines = () => {
  const [fines, setFines] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadFines = async () => {
    try {
      const { data } = await api.get('/fines/my');

      setFines(data.fines || []);
    } catch (error) {
      console.error('Failed to load fines:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFines();
  }, []);

  if (loading) {
    return (
      <div className="page-container">
        <h2>My Fines</h2>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="page-container">

      <h2>My Fines</h2>

      {fines.length === 0 ? (

        <div className="card">
          <p>No fines found.</p>
        </div>

      ) : (

        fines.map((fine) => (

          <div
            className="card"
            key={fine._id}
          >

            <h3>
              Fine: ₹{fine.amount}
            </h3>

            <p>
              <strong>Reason:</strong>{' '}
              {fine.reason}
            </p>

            <p>
              <strong>Status:</strong>{' '}
              {fine.status}
            </p>

            {fine.paidDate && (
              <p>
                <strong>Paid Date:</strong>{' '}
                {new Date(
                  fine.paidDate
                ).toLocaleDateString()}
              </p>
            )}

          </div>

        ))

      )}

    </div>
  );
};

export default MyFines;