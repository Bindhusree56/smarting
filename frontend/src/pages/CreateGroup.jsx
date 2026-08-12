import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const CreateGroup = () => {
  const { t } = useTranslation();
  const { updateUserGroup } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', village: '', address: '', description: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/groups', form);
      updateUserGroup(data.group._id);
      navigate('/group');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create group');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="card form-card">
        <h2>{t('group.createGroup')}</h2>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <label>{t('group.groupName')}</label>
          <input type="text" name="name" required value={form.name} onChange={handleChange} />

          <label>{t('group.village')}</label>
          <input type="text" name="village" value={form.village} onChange={handleChange} />

          <label>{t('group.address')}</label>
          <input type="text" name="address" value={form.address} onChange={handleChange} />

          <label>{t('group.description')}</label>
          <textarea name="description" rows={3} value={form.description} onChange={handleChange} />

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? t('common.loading') : t('common.submit')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateGroup;
