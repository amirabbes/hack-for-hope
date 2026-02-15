import React, { useState } from 'react';
import axios from 'axios';

const Signup = () => {
  const [formData, setFormData] = useState({ email: '', password: '', role: 'mother' });
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    setLoading(true);
    try {
      await axios.post('/api/auth/signup', formData);
      alert('Account created! Please login.');
      window.location.href = '/login';
    } catch (error) {
      alert('Signup failed: ' + (error.response?.data?.message || 'Error'));
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
          <h2 style={{ color: '#163260', fontWeight: 800, fontSize: '1.8rem' }}>Inscription</h2>
          <p style={{ color: '#64748b' }}>Rejoignez la plateforme Sup'Hope</p>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem', display: 'block' }}>Email Professionnel</label>
          <input
            type="email"
            placeholder="ex. nom@sos-tunisie.org"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid #cbd5e1' }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem', display: 'block' }}>Mot de passe</label>
          <input
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid #cbd5e1' }}
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem', display: 'block' }}>Rôle</label>
          <select
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid #cbd5e1' }}
          >
            <option value="mother">Mère SOS / Déclarant</option>
            <option value="psychologist">Psychologue</option>
            <option value="director">Directeur</option>
          </select>
        </div>

        <button
          onClick={handleSignup}
          style={{ width: '100%', background: 'linear-gradient(to right, #163260, #2a5298)', color: 'white', padding: '0.8rem', borderRadius: 'var(--radius-sm)', fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'transform 0.1s' }}
          disabled={loading}
        >
          {loading ? 'Création en cours...' : "S'inscrire"}
        </button>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem' }}>
          Déjà un compte ?{' '}
          <a href="/login" style={{ color: '#163260', textDecoration: 'none', fontWeight: 'bold' }}>
            Se connecter
          </a>
        </p>
      </div>
    </div>
  );
};

export default Signup;