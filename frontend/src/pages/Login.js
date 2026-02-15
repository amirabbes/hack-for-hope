import React, { useState } from 'react';
import axios from 'axios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authCode, setAuthCode] = useState('');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [devCode, setDevCode] = useState('');

  const handleLogin = async () => {
    setLoading(true);
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      if (response.data.requiresCode) {
        setStep(2);
        if (response.data.devCode) {
          setDevCode(response.data.devCode);
          setAuthCode(response.data.devCode);
        }
      }
    } catch (error) {
      alert('Login failed: ' + (error.response?.data?.message || 'Check credentials'));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    setLoading(true);
    try {
      const response = await axios.post('/api/auth/verify', { email, authCode });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('role', response.data.role);
      window.location.href = `/dashboard/${response.data.role}`;
    } catch (error) {
      alert('Verification failed: Invalid code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #163260 0%, #2a5298 100%)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '2rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Shapes */}
      <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '400px', height: '400px', background: '#f04e69', borderRadius: '50%', filter: 'blur(100px)', opacity: 0.2 }}></div>
      <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '300px', height: '300px', background: '#00aeef', borderRadius: '50%', filter: 'blur(100px)', opacity: 0.2 }}></div>

      <div className="card animate-in" style={{
        width: '100%',
        maxWidth: '420px',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.5)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
        padding: '2.5rem'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <img src="/img/logosos.png" alt="SOS" style={{ height: '50px' }} />
            <img src="/img/logosuphope.png" alt="Sup'Hope" style={{ height: '50px' }} />
          </div>
          <h2 style={{ color: '#163260', fontWeight: 800, fontSize: '1.8rem' }}>Bienvenue</h2>
          <p style={{ color: '#64748b' }}>Connectez-vous à la plateforme Sup'Hope</p>
        </div>

        <p style={{ marginBottom: '1.5rem', textAlign: 'center', fontSize: '0.9rem', color: '#163260', background: '#e2e8f0', padding: '0.5rem', borderRadius: '0.5rem' }}>
          {step === 1 ? '🔐 Double authentification sécurisée' : '📲 Entrez le code de vérification'}
        </p>

        {devCode && step === 2 && (
          <div style={{ background: '#dcfce7', border: '1px solid #86efac', borderRadius: '0.5rem', padding: '0.75rem', marginBottom: '1rem', textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#166534' }}>🔑 <strong>Dev Mode</strong> — Code: <strong style={{ fontSize: '1.2rem', letterSpacing: '0.2rem' }}>{devCode}</strong></p>
          </div>
        )}

        {step === 1 ? (
          <div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem', display: 'block' }}>Email Professionnel</label>
              <input
                type="email"
                placeholder="ex. psycho@sos-tunisie.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid #cbd5e1' }}
              />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem', display: 'block' }}>Mot de passe</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid #cbd5e1' }}
              />
            </div>
            <button
              onClick={handleLogin}
              style={{ width: '100%', background: 'linear-gradient(to right, #163260, #2a5298)', color: 'white', padding: '0.8rem', borderRadius: 'var(--radius-sm)', fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'transform 0.1s' }}
              disabled={loading}
            >
              {loading ? 'Connexion en cours...' : 'Se Connecter'}
            </button>
          </div>
        ) : (
          <div className="animate-in">
            <input
              type="text"
              placeholder="0 0 0 0 0 0"
              value={authCode}
              maxLength={6}
              onChange={(e) => setAuthCode(e.target.value)}
              style={{ width: '100%', padding: '1rem', fontSize: '1.5rem', textAlign: 'center', letterSpacing: '0.5rem', marginBottom: '1.5rem', borderRadius: 'var(--radius-sm)', border: '2px solid #3b82f6' }}
            />
            <button
              onClick={handleVerifyCode}
              style={{ width: '100%', background: '#10b981', color: 'white', padding: '0.8rem', borderRadius: 'var(--radius-sm)', fontWeight: 600, border: 'none', cursor: 'pointer' }}
              disabled={loading}
            >
              {loading ? 'Vérification...' : 'Valider l\'accès'}
            </button>
            <button
              onClick={() => setStep(1)}
              style={{ width: '100%', marginTop: '1rem', background: 'transparent', color: '#64748b', border: 'none', cursor: 'pointer', fontSize: '0.9rem' }}
            >
              ← Retour
            </button>
          </div>
        )}
        <p style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.8rem', color: '#94a3b8' }}>
          © 2026 SOS Villages d'Enfants Tunisie • Sup'Hope Platform
        </p>
      </div>
    </div>
  );
};

export default Login;