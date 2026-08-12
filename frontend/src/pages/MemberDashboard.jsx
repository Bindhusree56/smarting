import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const MemberDashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/groups/mine');
        setGroup(data.group);
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
          <Link to="/join-group" className="btn btn-primary">
            {t('group.joinGroup')}
          </Link>
        </div>
      ) : (
        <div className="card stat-card">
          <h3>{group.name}</h3>
          <p className="group-code-badge">{t('group.groupCode')}: <strong>{group.code}</strong></p>
          <p>{group.village}</p>
          <Link to="/group" className="btn btn-secondary">{t('group.myGroup')}</Link>
        </div>
      )}
    </div>
  );
};

export default MemberDashboard;
