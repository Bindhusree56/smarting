import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../api/axios';
import {
  addContribution,
  getGroupContributions,
} from '../api/contributionApi';

const Savings = () => {
  const { t } = useTranslation();
  const [members, setMembers] = useState([]);
  const [contributions, setContributions] = useState([]);
  const [totalSavings, setTotalSavings] = useState(0);

  const [form, setForm] = useState({
    memberId: '',
    amount: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    paymentDate: new Date().toISOString().slice(0, 10),
    status: 'paid',
    notes: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);

      const [membersResponse, savingsResponse] = await Promise.all([
        api.get('/members'),
        getGroupContributions(),
      ]);

      setMembers(membersResponse.data.members || []);
      setContributions(savingsResponse.contributions || []);
      setTotalSavings(savingsResponse.totalSavings || 0);
    } catch (err) {
      setError(
        err.response?.data?.message || 'Could not load savings data'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError('');
    setSuccess('');
    setSaving(true);

    try {
      await addContribution({
        ...form,
        amount: Number(form.amount),
        month: Number(form.month),
        year: Number(form.year),
      });

      setSuccess('Savings contribution added successfully!');

      setForm({
        ...form,
        memberId: '',
        amount: '',
        notes: '',
      });

      await loadData();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Could not add savings contribution'
      );
    } finally {
      setSaving(false);
    }
  };

  const getMonthName = (month) => {
    return new Date(2000, month - 1, 1).toLocaleString('en-US', {
      month: 'long',
    });
  };

  return (
    <div className="page-container">
     <h2>{t('savings.title')}</h2>
      <div className="card">
        <h3>{t('savings.totalSavings')}</h3>

        <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>
          ₹{totalSavings.toLocaleString()}
        </p>
      </div>

      <div className="card">
        <h3>Add Monthly Contribution</h3>

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        {success && (
          <div className="alert alert-success">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label>Member</label>

          <select
            name="memberId"
            value={form.memberId}
            onChange={handleChange}
            required
          >
            <option value="">Select Member</option>

            {members
              .filter((member) => member.status === 'active')
              .map((member) => (
                <option key={member._id} value={member._id}>
                  {member.name} - {member.mobile}
                </option>
              ))}
          </select>

          <label>Amount</label>

          <input
            type="number"
            name="amount"
            min="1"
            placeholder="Enter amount"
            value={form.amount}
            onChange={handleChange}
            required
          />

          <label>Month</label>

          <select
            name="month"
            value={form.month}
            onChange={handleChange}
          >
            {Array.from({ length: 12 }, (_, index) => {
              const month = index + 1;

              return (
                <option key={month} value={month}>
                  {getMonthName(month)}
                </option>
              );
            })}
          </select>

          <label>Year</label>

          <input
            type="number"
            name="year"
            value={form.year}
            onChange={handleChange}
            required
          />

          <label>Payment Date</label>

          <input
            type="date"
            name="paymentDate"
            value={form.paymentDate}
            onChange={handleChange}
          />

          <label>Status</label>

          <select
            name="status"
            value={form.status}
            onChange={handleChange}
          >
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
          </select>

          <label>Notes</label>

          <input
            type="text"
            name="notes"
            placeholder="Optional"
            value={form.notes}
            onChange={handleChange}
          />

          <button
            type="submit"
            className="btn btn-primary"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Add Contribution'}
          </button>
        </form>
      </div>

      <div className="card">
        <h3>Contribution History</h3>

        {loading ? (
          <p>Loading...</p>
        ) : contributions.length === 0 ? (
          <p className="muted">
            No contributions recorded yet.
          </p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Member</th>
                <th>Month</th>
                <th>Amount</th>
                <th>Payment Date</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {contributions.map((item) => (
                <tr key={item._id}>
                  <td>{item.member?.name}</td>

                  <td>
                    {getMonthName(item.month)} {item.year}
                  </td>

                  <td>
                    ₹{item.amount.toLocaleString()}
                  </td>

                  <td>
                    {new Date(
                      item.paymentDate
                    ).toLocaleDateString()}
                  </td>

                  <td>
                    <span
                      className={`status-badge status-${item.status}`}
                    >
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Savings;