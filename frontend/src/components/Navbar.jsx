import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import LanguageSwitcher from './LanguageSwitcher';

const Navbar = () => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="navbar">
      <Link to={user ? '/dashboard' : '/login'} className="brand">
        {t('appName')}
      </Link>
      <div className="navbar-right">
        <LanguageSwitcher compact />
        {user && (
          <>
            <span className="navbar-user">
              {t('common.welcome')}, {user.name}
            </span>
            <button className="btn btn-ghost" onClick={handleLogout}>
              {t('nav.logout')}
            </button>
          </>
        )}
      </div>
    </header>
  );
};

export default Navbar;
