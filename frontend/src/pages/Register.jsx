import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import LanguageSwitcher from '../components/LanguageSwitcher';

const Register = () => {
  const { t, i18n } = useTranslation();
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    mobile: '',
    password: '',
    confirmPassword: '',
    role: 'member',
  });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const passwordsMatch = form.confirmPassword.length > 0 && form.password === form.confirmPassword;
  const passwordsMismatch = form.confirmPassword.length > 0 && form.password !== form.confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    const result = await register({
      name: form.name,
      mobile: form.mobile,
      password: form.password,
      role: form.role,
      preferredLanguage: i18n.language,
    });

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h1>{t('appName')}</h1>
          <p className="tagline">{t('tagline')}</p>
          <LanguageSwitcher />
        </div>

        <h2>{t('auth.register')}</h2>
        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <label>{t('auth.name')}</label>
          <input type="text" name="name" required value={form.name} onChange={handleChange} />

          <label>{t('auth.mobile')}</label>
          <input
            type="tel"
            name="mobile"
            pattern="[0-9]{10}"
            maxLength={10}
            required
            value={form.mobile}
            onChange={handleChange}
            placeholder="9876543210"
          />

          <label>{t('auth.password')}</label>
          <div className="password-field">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              minLength={6}
              required
              value={form.password}
              onChange={handleChange}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
            >
              {showPassword ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>

          <label>{t('auth.confirmPassword')}</label>
          <div className="password-field">
            <input
              type={showConfirm ? 'text' : 'password'}
              name="confirmPassword"
              minLength={6}
              required
              value={form.confirmPassword}
              onChange={handleChange}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowConfirm(!showConfirm)}
              tabIndex={-1}
            >
              {showConfirm ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
          {passwordsMatch && <p className="password-match match">✓ {t('auth.passwordsMatch')}</p>}
          {passwordsMismatch && <p className="password-match mismatch">✗ {t('auth.passwordsDoNotMatch')}</p>}

          <label>{t('auth.role')}</label>
          <div className="role-select">
            <label className="radio-option">
              <input
                type="radio"
                name="role"
                value="member"
                checked={form.role === 'member'}
                onChange={handleChange}
              />
              {t('auth.roleMember')}
            </label>
            <label className="radio-option">
              <input
                type="radio"
                name="role"
                value="head"
                checked={form.role === 'head'}
                onChange={handleChange}
              />
              {t('auth.roleHead')}
            </label>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? t('common.loading') : t('auth.registerButton')}
          </button>
        </form>

        <div className="auth-links">
          <span>
            {t('auth.haveAccount')} <Link to="/login">{t('auth.login')}</Link>
          </span>
        </div>
      </div>
    </div>
  );
};

export default Register;
