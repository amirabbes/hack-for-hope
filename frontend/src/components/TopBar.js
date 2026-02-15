import React from 'react';
import { useLanguage } from '../context/LanguageContext';

const TopBar = ({ role }) => {
    const { t, language, toggleLanguage } = useLanguage();

    // Fallback for role translation
    const roleLabel = t(`role.${role}`) !== `role.${role}` ? t(`role.${role}`) : role;

    const handleLogout = () => {
        localStorage.clear();
        window.location.href = '/login';
    };

    return (
        <div className="top-bar">
            <div className="logo" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <img src="/img/logosos.png" alt="SOS Tunisie" style={{ height: '40px' }} />
                <div style={{ height: '30px', borderLeft: '1px solid rgba(255,255,255,0.3)' }}></div>
                <img src="/img/logosuphope.png" alt="Sup'Hope" style={{ height: '40px' }} />
                <span style={{ fontSize: '1.2rem', fontWeight: 600, letterSpacing: '0.5px' }}>{t('app.title')}</span>
            </div>
            <div className="user-section">
                <button onClick={toggleLanguage} className="btn-ghost" style={{ marginRight: '1rem', fontSize: '1.2rem' }}>
                    {language === 'fr' ? '🇹🇳 AR' : '🇫🇷 FR'}
                </button>
                <span className="role-badge">{roleLabel}</span>
                <button className="btn-logout" onClick={handleLogout}>{t('logout')}</button>
            </div>
        </div>
    );
};

export default TopBar;
