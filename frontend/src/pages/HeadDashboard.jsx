import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const HeadDashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [group, setGroup] = useState(null);
  const [memberCount, setMemberCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/groups/mine');
        setGroup(data.group);
        setMemberCount(data.memberCount);
      } catch {
        setGroup(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div className="page-container">{t('common.loading')}</div>;

  return (
    <div className="page-container">
      <h2>{t('common.welcome')}, {user.name}</h2>

      {!group ? (
        <div className="card">
          <p>{t('group.noGroup')}</p>
          <Link to="/create-group" className="btn btn-primary">
            {t('group.createGroup')}
          </Link>
        </div>
      ) : (
        <div className="dashboard-grid">
          <div className="card stat-card">
            <h3>{group.name}</h3>
            <p className="group-code-badge">{t('group.groupCode')}: <strong>{group.code}</strong></p>
            <p>{t('group.memberCount')}: <strong>{memberCount}</strong></p>
            <Link to="/group" className="btn btn-secondary">{t('group.myGroup')}</Link>
          </div>
          <div className="card action-card">
  <h3>{t('member.members')}</h3>

  <p className="muted">
    Add, edit, search, or remove members of your SHG.
  </p>

  <Link to="/savings" className="btn btn-primary">
    Savings Management
  </Link>

  <Link to="/meetings" className="btn btn-secondary">
    Meeting Management
  </Link>
</div>
        </div>
      )}
    </div>
  );
};

export default HeadDashboard;
