import { useEffect, useState } from 'react';
import api from '../api/axios';

const MyLoans = () => {
  

  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    amount: '',
    interestRate: '12',
    durationMonths: '12',
  });

  const [message, setMessage] = useState('');

  const loadLoans = async () => {
    try {
      const { data } = await api.get('/loans/my');

setLoans(data.loans);
    } catch (error) {
      console.error('Failed to load loans:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLoans();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const calculateMonthly = () => {
    const amount = Number(form.amount);
    const rate = Number(form.interestRate);
    const months = Number(form.durationMonths);

    if (!amount || !months) return 0;

    const interest = amount * rate * (months / 12) / 100;

    const total = amount + interest;

    return (total / months).toFixed(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage('');

    try {
      /*
       * IMPORTANT:
       * These IDs must come from your existing logged-in user's
       * member/group information.
       */

      await api.post('/loans/request', {
  principalAmount: Number(form.amount),
  interestRate: Number(form.interestRate),
  durationMonths: Number(form.durationMonths),
});

      setMessage('Loan request submitted successfully!');

      setForm({
        amount: '',
        interestRate: '12',
        durationMonths: '12',
      });

      loadLoans();
    } catch (error) {
      console.error('Loan request error:', error);

      setMessage(
        error.response?.data?.message ||
          'Failed to submit loan request'
      );
    }
  };

  if (loading) {
    return <div className="page-container">Loading loans...</div>;
  }

  return (
    <div className="page-container">

      <h2>My Loans</h2>

      {/* Loan Request Form */}
      <div className="card">

        <h3>Request New Loan</h3>

        <form onSubmit={handleSubmit}>

          <div className="form-group">
            <label>Loan Amount</label>

            <input
              type="number"
              name="amount"
              value={form.amount}
              onChange={handleChange}
              placeholder="Enter amount"
              min="1"
              required
            />
          </div>


          <div className="form-group">
            <label>Interest Rate (%)</label>

            <input
              type="number"
              name="interestRate"
              value={form.interestRate}
              onChange={handleChange}
              min="0"
              step="0.1"
              required
            />
          </div>


          <div className="form-group">
            <label>Duration</label>

            <select
              name="durationMonths"
              value={form.durationMonths}
              onChange={handleChange}
            >
              <option value="6">6 Months</option>
              <option value="12">12 Months</option>
              <option value="18">18 Months</option>
              <option value="24">24 Months</option>
            </select>
          </div>


          {form.amount && (
            <div className="loan-calculation">

              <p>
                Estimated Monthly Payment:
              </p>

              <h3>
                ₹{calculateMonthly()}
              </h3>

            </div>
          )}


          <button
            type="submit"
            className="btn btn-primary"
          >
            Request Loan
          </button>

        </form>


        {message && (
          <p className="form-message">
            {message}
          </p>
        )}

      </div>


      {/* Existing Loans */}

      <div className="card">

        <h3>My Loan History</h3>

        {loans.length === 0 ? (

          <p>No loans found.</p>

        ) : (

          <div className="loan-list">

            {loans.map((loan) => (

              <div
                className="loan-card"
                key={loan._id}
              >

                <h4>
                  ₹{loan.principalAmount}
                </h4>

                <p>
                  Interest: {loan.interestRate}%
                </p>

                <p>
                  Duration: {loan.durationMonths} months
                </p>

                <p>
                  Monthly Payment: ₹
                  {loan.monthlyPayment}
                </p>

                <p>
                  Total Payable: ₹
                  {loan.totalPayable}
                </p>

                <p>
                  Remaining: ₹
                  {loan.remainingBalance}
                </p>

                <strong>
                  Status: {loan.status}
                </strong>

              </div>

            ))}

          </div>

        )}

      </div>

    </div>
  );
};

export default MyLoans;