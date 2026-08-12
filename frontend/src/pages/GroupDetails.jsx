import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const GroupDetails = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const isHead = user.role === 'head';

  const [group, setGroup] = useState(null);
  const [memberCount, setMemberCount] = useState(0);
  const [pending, setPending] = useState([]);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', village: '', address: '', description: '' });
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(true);

  const loadGroup = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/groups/mine');
      setGroup(data.group);
      setMemberCount(data.memberCount);
      setForm({
        name: data.group.name || '',
        village: data.group.village || '',
        address: data.group.address || '',
        description: data.group.description || '',
      });
      if (isHead) {
        const pendingRes = await api.get(`/groups/${data.group._id}/pending`);
        setPending(pendingRes.data.pending);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load group');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGroup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { data } = await api.put(`/groups/${group._id}`, form);
      setGroup(data.group);
      setEditing(false);
      setInfo('Group details updated');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update group');
    }
  };

  const handleApprove = async (memberId) => {
    try {
      await api.put(`/groups/${group._id}/approve/${memberId}`);
      setPending((prev) => prev.filter((m) => m._id !== memberId));
      setMemberCount((c) => c + 1);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not approve member');
    }
  };

  if (loading) return <div className="page-container">{t('common.loading')}</div>;

  if (error && !group) {
    return (
      <div className="page-container">
        <div className="card">
          <p>{t('group.noGroup')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="card">
        {info && <div className="alert alert-info">{info}</div>}
        {error && <div className="alert alert-error">{error}</div>}

        {!editing ? (
          <>
            <div className="group-header">
              <h2>{group.name}</h2>
              {isHead && (
                <button className="btn btn-secondary" onClick={() => setEditing(true)}>
                  {t('group.editGroup')}
                </button>
              )}
            </div>
            <p className="group-code-badge">
              {t('group.groupCode')}: <strong>{group.code}</strong>
            </p>
            <p>{group.village}</p>
            <p>{group.address}</p>
            <p className="muted">{group.description}</p>
            <p>
              {t('group.memberCount')}: <strong>{memberCount}</strong>
            </p>
            <p className="muted">Head: {group.head?.name} ({group.head?.mobile})</p>
          </>
        ) : (
          <form onSubmit={handleSave}>
            <label>{t('group.groupName')}</label>
            <input type="text" name="name" required value={form.name} onChange={handleChange} />
            <label>{t('group.village')}</label>
            <input type="text" name="village" value={form.village} onChange={handleChange} />
            <label>{t('group.address')}</label>
            <input type="text" name="address" value={form.address} onChange={handleChange} />
            <label>{t('group.description')}</label>
            <textarea name="description" rows={3} value={form.description} onChange={handleChange} />
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">{t('member.save')}</button>
              <button type="button" className="btn btn-ghost" onClick={() => setEditing(false)}>
                {t('common.cancel')}
              </button>
            </div>
          </form>
        )}
      </div>

      {isHead && (
        <div className="card">
          <h3>{t('group.pendingRequests')}</h3>
          {pending.length === 0 ? (
            <p className="muted">{t('member.noMembers')}</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>{t('auth.name')}</th>
                  <th>{t('auth.mobile')}</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {pending.map((m) => (
                  <tr key={m._id}>
                    <td>{m.name}</td>
                    <td>{m.mobile}</td>
                    <td>
                      <button className="btn btn-small btn-primary" onClick={() => handleApprove(m._id)}>
                        {t('group.approve')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default GroupDetails;
