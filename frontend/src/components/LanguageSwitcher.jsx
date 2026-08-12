import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

const LanguageSwitcher = ({ compact }) => {
  const { i18n } = useTranslation();
  const { setLanguage } = useAuth();

  const handleChange = (lang) => {
    setLanguage(lang);
  };

  return (
    <div className={`lang-switcher ${compact ? 'compact' : ''}`}>
      <button
        type="button"
        className={i18n.language === 'en' ? 'lang-btn active' : 'lang-btn'}
        onClick={() => handleChange('en')}
      >
        English
      </button>
      <button
        type="button"
        className={i18n.language === 'te' ? 'lang-btn active' : 'lang-btn'}
        onClick={() => handleChange('te')}
      >
        తెలుగు
      </button>
    </div>
  );
};

export default LanguageSwitcher;
