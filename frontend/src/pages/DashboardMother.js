import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TopBar from '../components/TopBar';
import { useLanguage } from '../context/LanguageContext';

const DashboardMother = () => {
  const { t } = useLanguage();
  const [report, setReport] = useState({
    anonymous: false, program: '', abuserFirstName: '', abuserLastName: '',
    childFirstName: '', childLastName: '', incidentDescription: '',
    incidentType: '', urgency: '', attachments: []
  });
  const [submitting, setSubmitting] = useState(false);
  const [myReports, setMyReports] = useState([]);
  const [view, setView] = useState('form');

  useEffect(() => { loadMyReports(); }, []);

  const loadMyReports = async () => {
    try {
      const res = await axios.get('/api/reports/my-reports');
      setMyReports(res.data);
    } catch (e) { console.error(e); }
  };

  const handleChange = (e) => setReport({ ...report, [e.target.name]: e.target.value });

  const handleFileChange = (e) => {
    if (e.target.files) {
      // Safety check to avoid any potential crashes
      const files = Array.from(e.target.files).filter(f => f && f.type);
      setReport({ ...report, attachments: files });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const formData = new FormData();
    Object.keys(report).forEach(key => {
      if (key === 'attachments') {
        if (report.attachments && report.attachments.length > 0) {
          Array.from(report.attachments).forEach(file => {
            if (file) formData.append('attachments', file);
          });
        }
      } else {
        formData.append(key, report[key]);
      }
    });

    try {
      await axios.post('/api/reports/create', formData);
      alert('✅ ' + t('mother.form.submit') + ' !'); // Success message
      setReport({
        anonymous: false, program: '', abuserFirstName: '', abuserLastName: '',
        childFirstName: '', childLastName: '', incidentDescription: '',
        incidentType: '', urgency: '', attachments: []
      });
      loadMyReports();
    } catch (error) {
      alert('❌ Error: ' + (error.response?.data?.message || 'Erreur'));
    } finally { setSubmitting(false); }
  };

  const getBadge = (status) => {
    const map = {
      en_attente: { cls: 'badge-warning', label: t('status.pending') },
      en_cours: { cls: 'badge-info', label: t('status.in_progress') },
      fausse_signalement: { cls: 'badge-danger', label: 'Fausse' }, // TODO: Add translation
      cloture: { cls: 'badge-success', label: t('status.closed') }
    };
    const b = map[status] || map.en_attente;
    return <span className={`badge ${b.cls}`}>{b.label}</span>;
  };

  const getUrgencyBadge = (u) => {
    const map = { low: 'badge-neutral', medium: 'badge-warning', high: 'badge-danger', critical: 'badge-danger' };
    return <span className={`badge ${map[u] || 'badge-neutral'}`}>{u}</span>;
  };

  const stats = {
    total: myReports.length,
    pending: myReports.filter(r => r.status === 'en_attente').length,
    inProgress: myReports.filter(r => r.status === 'en_cours').length,
    closed: myReports.filter(r => r.status === 'cloture').length
  };

  return (
    <div className="app-layout">
      <TopBar role={localStorage.getItem('role') || 'mother'} />
      <div className="page-content">
        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#eff6ff', color: '#2563eb' }}>📋</div>
            <div className="stat-info">
              <div className="stat-value">{stats.total}</div>
              <div className="stat-label">{t('mother.stats.total')}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#fef3c7', color: '#d97706' }}>⏳</div>
            <div className="stat-info">
              <div className="stat-value">{stats.pending}</div>
              <div className="stat-label">{t('mother.stats.pending')}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#dbeafe', color: '#2563eb' }}>🔄</div>
            <div className="stat-info">
              <div className="stat-value">{stats.inProgress}</div>
              <div className="stat-label">{t('mother.stats.inProgress')}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#d1fae5', color: '#059669' }}>✅</div>
            <div className="stat-info">
              <div className="stat-value">{stats.closed}</div>
              <div className="stat-label">{t('mother.stats.closed')}</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs" style={{ maxWidth: '340px', marginBottom: '1.5rem' }}>
          <button className={`tab ${view === 'form' ? 'active' : ''}`} onClick={() => setView('form')}>
            {t('mother.tabs.new')}
          </button>
          <button className={`tab ${view === 'history' ? 'active' : ''}`} onClick={() => setView('history')}>
            {t('mother.tabs.history')}
          </button>
        </div>

        {/* Form View */}
        {view === 'form' && (
          <div className="card animate-in">
            <div className="card-header">
              <div>
                <h3>{t('mother.form.title')}</h3>
                <p className="subtitle">{t('mother.form.subtitle')}</p>
              </div>
            </div>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                {/* Left Column */}
                <div>
                  <div className="form-group">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginBottom: '1rem' }}>
                      <input type="checkbox" checked={report.anonymous}
                        onChange={(e) => setReport({ ...report, anonymous: e.target.checked })}
                        style={{ width: 'auto', margin: 0, accentColor: 'var(--primary)' }} />
                      <span style={{ fontSize: '0.9rem' }}>{t('mother.form.anonymous')}</span>
                    </label>
                  </div>
                  <div className="form-group">
                    <label>{t('mother.form.village')}</label>
                    <select name="program" value={report.program} onChange={handleChange} required>
                      <option value="">{t('select')}</option>
                      <option value="Mahras">Mahras</option>
                      <option value="Gammarth">Gammarth</option>
                      <option value="Siliana">Siliana</option>
                      <option value="Akouda">Akouda</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>{t('mother.form.abuserFirst')}</label>
                    <input name="abuserFirstName" placeholder="" value={report.abuserFirstName} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label>{t('mother.form.abuserLast')}</label>
                    <input name="abuserLastName" placeholder="" value={report.abuserLastName} onChange={handleChange} />
                  </div>
                </div>

                {/* Right Column */}
                <div>
                  <div className="form-group">
                    <label>{t('mother.form.childFirst')}</label>
                    <input name="childFirstName" placeholder="" value={report.childFirstName} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label>{t('mother.form.childLast')}</label>
                    <input name="childLastName" placeholder="" value={report.childLastName} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label>{t('mother.form.type')}</label>
                    <select name="incidentType" value={report.incidentType} onChange={handleChange} required>
                      <option value="">{t('select')}</option>
                      <option value="health">🏥 Santé</option>
                      <option value="behavior">🧠 Comportement</option>
                      <option value="violence">⚠️ Violence</option>
                      <option value="neglect">🚫 Négligence</option>
                      <option value="sexual">🔴 Abus sexuel</option>
                      <option value="other">📌 Autre</option>
                    </select>
                  </div>
                  <div className="form-group">
                    {/* Urgency is now determined by AI */}
                    <input type="hidden" name="urgency" value="" />
                  </div>
                </div>
              </div>

              {/* Full Width Fields */}
              <div className="form-group" style={{ marginTop: '0.5rem' }}>
                <label>{t('mother.form.desc')}</label>
                <textarea name="incidentDescription" placeholder="..."
                  value={report.incidentDescription} onChange={handleChange}
                  style={{ height: '120px', resize: 'vertical' }} required />

                <div style={{ marginTop: '0.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <button type="button" className="btn-secondary btn-sm"
                    onClick={async () => {
                      if (!report.incidentDescription) return alert('Ecrivez une description d\'abord.');
                      try {
                        const res = await axios.post('/api/reports/analyze', { text: report.incidentDescription });
                        alert(`📊 Résultat Analyse IA:\nRISQUE: ${res.data.risk.toUpperCase()}\nCONFIANCE: ${Math.round(res.data.confidence * 100)}%`);
                        // Auto-set urgency in background for report
                        setReport({ ...report, urgency: res.data.risk, aiAnalysis: res.data });
                      } catch (e) { alert('Erreur Analyse'); }
                    }}
                  >
                    ✨ Analyser avec IA
                  </button>
                  {report.aiAnalysis && (
                    <span className={`badge ${report.aiAnalysis.risk === 'critical' ? 'badge-danger' : 'badge-info'}`}>
                      Résultat: {report.aiAnalysis.risk.toUpperCase()}
                    </span>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label>{t('mother.form.files')}</label>
                <div className="file-upload">
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>📎 {t('select')}</p>
                  <input type="file" multiple onChange={handleFileChange} accept="image/*,audio/*,video/*" />
                </div>
              </div>

              <button type="submit" className="btn-primary btn-lg" style={{ width: '100%' }} disabled={submitting}>
                {submitting ? t('loading') : t('mother.form.submit')}
              </button>
            </form>
          </div>
        )}

        {/* History View */}
        {view === 'history' && (
          <div className="card animate-in">
            <div className="card-header">
              <div>
                <h3>{t('mother.history.title')}</h3>
                <p className="subtitle">{myReports.length} signalements</p>
              </div>
            </div>
            {myReports.length === 0 ? (
              <div className="empty-state">
                <div className="icon">📭</div>
                <p>{t('mother.history.empty')}</p>
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>{t('mother.form.childFirst')}</th>
                    <th>{t('mother.form.type')}</th>
                    <th>{t('mother.form.urgency')}</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {myReports.map(r => (
                    <tr key={r._id}>
                      <td style={{ fontWeight: 600 }}>{r.childFirstName} {r.childLastName}</td>
                      <td>{r.incidentType}</td>
                      <td>{getUrgencyBadge(r.urgency)}</td>
                      <td>{getBadge(r.status)}</td>
                      <td style={{ color: 'var(--text-muted)' }}>{new Date(r.createdAt).toLocaleDateString(t('lang') === 'ar' ? 'ar-TN' : 'fr-FR')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardMother;