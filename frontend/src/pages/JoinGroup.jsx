import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../api/axios';

const JoinGroup = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [code, setCode] = useState('');
  const [preview, setPreview] = useState(null);
  const [aadhaar, setAadhaar] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const lookupCode = async (e) => {
    e.preventDefault();
    setError('');
    setPreview(null);
    setLoading(true);
    try {
      const { data } = await api.get(`/groups/lookup/${code.trim()}`);
      setPreview(data.group);
    } catch (err) {
      setError(err.response?.data?.message || 'Group not found');
    } finally {
      setLoading(false);
    }
  };

  const submitJoin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/groups/join', { code: code.trim(), aadhaar, address });
      setSuccess('Join request submitted. Waiting for the group head to approve.');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not join group');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="page-container">
        <div className="card form-card">
          <div className="alert alert-info">{success}</div>
          <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
            {t('nav.dashboard')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="card form-card">
        <h2>{t('group.joinGroup')}</h2>
        {error && <div className="alert alert-error">{error}</div>}

        {!preview ? (
          <form onSubmit={lookupCode}>
            <label>{t('group.enterCode')}</label>
            <input
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="SHG-XXXXXX"
            />
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? t('common.loading') : t('common.submit')}
            </button>
          </form>
        ) : (
          <form onSubmit={submitJoin}>
            <div className="group-preview">
              <h3>{preview.name}</h3>
              <p>{preview.village}</p>
              <p className="muted">Head: {preview.head?.name}</p>
            </div>

            <label>{t('member.aadhaar')}</label>
            <input
              type="text"
              pattern="[0-9]{12}"
              maxLength={12}
              value={aadhaar}
              onChange={(e) => setAadhaar(e.target.value)}
            />

            <label>{t('group.address')}</label>
            <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} />

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? t('common.loading') : t('group.joinGroup')}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default JoinGroup;
