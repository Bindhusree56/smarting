import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../api/axios';

const emptyForm = { name: '', mobile: '', aadhaar: '', address: '', joinDate: '' };

const MemberManagement = () => {
  const { t } = useTranslation();

  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const loadMembers = async (query = '') => {
    setLoading(true);
    try {
      const { data } = await api.get('/members', { params: query ? { search: query } : {} });
      setMembers(data.members);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load members');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, []);

  useEffect(() => {
    const delay = setTimeout(() => loadMembers(search), 300);
    return () => clearTimeout(delay);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const openAddForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
    setError('');
  };

  const openEditForm = (member) => {
    setForm({
      name: member.name,
      mobile: member.mobile,
      aadhaar: member.aadhaar || '',
      address: member.address || '',
      joinDate: member.joinDate ? member.joinDate.slice(0, 10) : '',
    });
    setEditingId(member._id);
    setShowForm(true);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editingId) {
        await api.put(`/members/${editingId}`, form);
      } else {
        await api.post('/members', form);
      }
      setShowForm(false);
      loadMembers(search);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save member');
    }
  };

  const handleRemove = async (id) => {
    if (!window.confirm('Remove this member?')) return;
    try {
      await api.delete(`/members/${id}`);
      loadMembers(search);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not remove member');
    }
  };

  return (
    <div className="page-container">
      <div className="card">
        <div className="group-header">
          <h2>{t('member.members')}</h2>
          <button className="btn btn-primary" onClick={openAddForm}>
            {t('member.addMember')}
          </button>
        </div>

        <input
          type="text"
          className="search-input"
          placeholder={t('member.search')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {error && <div className="alert alert-error">{error}</div>}

        {loading ? (
          <p>{t('common.loading')}</p>
        ) : members.length === 0 ? (
          <p className="muted">{t('member.noMembers')}</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>{t('auth.name')}</th>
                <th>{t('auth.mobile')}</th>
                <th>{t('member.joinDate')}</th>
                <th>{t('member.status')}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m._id}>
                  <td>{m.name}</td>
                  <td>{m.mobile}</td>
                  <td>{new Date(m.joinDate).toLocaleDateString()}</td>
                  <td>
                    <span className={`status-badge status-${m.status}`}>
                      {t(`member.${m.status}`)}
                    </span>
                  </td>
                  <td className="row-actions">
                    <button className="btn btn-small btn-secondary" onClick={() => openEditForm(m)}>
                      {t('member.editMember')}
                    </button>
                    <button className="btn btn-small btn-danger" onClick={() => handleRemove(m._id)}>
                      {t('member.removeMember')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showForm && (
        <div className="modal-backdrop" onClick={() => setShowForm(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h3>{editingId ? t('member.editMember') : t('member.addMember')}</h3>
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
              />

              <label>{t('member.aadhaar')}</label>
              <input
                type="text"
                name="aadhaar"
                pattern="[0-9]{12}"
                maxLength={12}
                value={form.aadhaar}
                onChange={handleChange}
              />

              <label>{t('group.address')}</label>
              <input type="text" name="address" value={form.address} onChange={handleChange} />

              <label>{t('member.joinDate')}</label>
              <input type="date" name="joinDate" value={form.joinDate} onChange={handleChange} />

              <div className="form-actions">
                <button type="submit" className="btn btn-primary">{t('member.save')}</button>
                <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>
                  {t('common.cancel')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberManagement;
