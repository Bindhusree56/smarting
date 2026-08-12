import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../api/axios';
import LanguageSwitcher from '../components/LanguageSwitcher';

const ForgotPassword = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1 = request code, 2 = reset password
  const [mobile, setMobile] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);

  const requestCode = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/forgot-password', { mobile });
      setInfo(
        data.resetToken
          ? `${data.message} (Dev code: ${data.resetToken})`
          : data.message
      );
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { mobile, resetToken, newPassword });
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h1>{t('appName')}</h1>
          <LanguageSwitcher />
        </div>

        <h2>{t('auth.forgotPassword')}</h2>
        {error && <div className="alert alert-error">{error}</div>}
        {info && <div className="alert alert-info">{info}</div>}

        {step === 1 ? (
          <form onSubmit={requestCode}>
            <label>{t('auth.mobile')}</label>
            <input
              type="tel"
              pattern="[0-9]{10}"
              maxLength={10}
              required
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
            />
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? t('common.loading') : t('auth.sendResetCode')}
            </button>
          </form>
        ) : (
          <form onSubmit={resetPassword}>
            <label>{t('auth.resetCode')}</label>
            <input
              type="text"
              required
              value={resetToken}
              onChange={(e) => setResetToken(e.target.value)}
            />
            <label>{t('auth.newPassword')}</label>
            <input
              type="password"
              minLength={6}
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? t('common.loading') : t('auth.resetPassword')}
            </button>
          </form>
        )}

        <div className="auth-links">
          <Link to="/login">{t('auth.backToLogin')}</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
