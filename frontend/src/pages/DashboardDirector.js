import React, { useEffect, useState } from 'react';
import axios from 'axios';
import TopBar from '../components/TopBar';
import { useLanguage } from '../context/LanguageContext';

const DashboardDirector = () => {
  const { t } = useLanguage();
  const [reports, setReports] = useState([]);
  const [villageStats, setVillageStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('overview');
  const [filterVillage, setFilterVillage] = useState('All');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [reportsRes, statsRes] = await Promise.all([
        axios.get('/api/reports/final'),
        axios.get('/api/reports/by-village')
      ]);
      setReports(reportsRes.data);
      setVillageStats(statsRes.data);
    } catch (error) { console.error('Error loading data'); }
    finally { setLoading(false); }
  };

  const handleDecision = async (id, decision) => {
    if (!window.confirm(`Confirmer la décision : ${decision} ?`)) return;
    try {
      await axios.put(`/api/reports/${id}/decision`, { decision });
      loadData();
    } catch (error) { alert('❌ Échec'); }
  };

  const getStatusBadge = (r) => {
    if (r.status === 'overdue') return <span className="badge badge-danger">⚠️ {t('status.overdue')}</span>;
    if (r.deadline && new Date(r.deadline) < new Date() && r.status === 'en_cours') return <span className="badge badge-danger">⚠️ {t('status.overdue')}</span>;

    const map = {
      en_attente: { cls: 'badge-warning', label: t('status.pending') },
      en_cours: { cls: 'badge-info', label: t('status.in_progress') },
      cloture: { cls: 'badge-success', label: t('status.closed') }
    };
    const b = map[r.status] || { cls: 'badge-neutral', label: r.status };
    return <span className={`badge ${b.cls}`}>{b.label}</span>;
  };

  const filteredReports = reports.filter(r => filterVillage === 'All' || r.village === filterVillage);

  return (
    <div className="app-layout">
      <TopBar role="director" />
      <div className="page-content">

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '1.8rem', color: 'var(--primary-dark)' }}>{t('director.title')}</h1>
            <p className="subtitle">{t('director.subtitle')}</p>
          </div>
          <div className="tabs" style={{ margin: 0 }}>
            <button className={`tab ${activeView === 'overview' ? 'active' : ''}`} onClick={() => setActiveView('overview')}>{t('director.view.overview')}</button>
            <button className={`tab ${activeView === 'reports' ? 'active' : ''}`} onClick={() => setActiveView('reports')}>{t('director.view.reports')}</button>
          </div>
        </div>

        {loading ? <p style={{ textAlign: 'center' }}>{t('loading')}</p> : (
          <div className="animate-in">
            {activeView === 'overview' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {villageStats.map(v => (
                  <div key={v._id} className={`village-card ${v.critical > 0 ? 'critical' : ''}`}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                      <h3 style={{ fontSize: '1.2rem' }}>{v._id || 'Village inconnu'}</h3>
                      {v.critical > 0 && <span className="badge badge-danger">⚠️ {v.critical} critiques</span>}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <div style={{ background: 'var(--bg)', padding: '1rem', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)' }}>{v.total}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t('mother.stats.total')}</div>
                      </div>
                      <div style={{ background: 'var(--success-light)', padding: '1rem', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--success)' }}>{v.cloture}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--success)' }}>{t('mother.stats.closed')}</div>
                      </div>
                    </div>

                    <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-light)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                        <span>{t('mother.stats.pending')}:</span>
                        <span style={{ fontWeight: 600 }}>{v.enAttente}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                        <span>{t('mother.stats.inProgress')}:</span>
                        <span style={{ fontWeight: 600 }}>{v.enCours}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeView === 'reports' && (
              <div className="card">
                <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <h3>{t('director.view.reports')}</h3>
                  <select
                    value={filterVillage}
                    onChange={(e) => setFilterVillage(e.target.value)}
                    style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}
                  >
                    <option value="All">{t('select')}</option>
                    <option value="Mahras">Mahras</option>
                    <option value="Gammarth">Gammarth</option>
                    <option value="Siliana">Siliana</option>
                    <option value="Akouda">Akouda</option>
                  </select>
                </div>
                {filteredReports.length === 0 ? <div className="empty-state">✅</div> : (
                  <table>
                    <thead>
                      <tr>
                        <th>{t('director.table.child')}</th>
                        <th>{t('director.table.village')}</th>
                        <th>{t('director.table.class')}</th>
                        <th>{t('director.table.status')}</th>
                        <th>{t('director.table.decision')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredReports.filter(r => !r.archived).map(r => (
                        <tr key={r._id} style={{
                          background: (r.status === 'overdue' || (r.deadline && new Date(r.deadline) < new Date() && r.status === 'en_cours')) ? '#fef2f2' : 'transparent'
                        }}>
                          <td style={{ fontWeight: 600 }}>
                            {r.childFirstName} {r.childLastName}
                            {(r.status === 'overdue' || (r.deadline && new Date(r.deadline) < new Date() && r.status === 'en_cours')) && (
                              <div style={{ fontSize: '0.7rem', color: 'var(--danger)', fontWeight: 700 }}>⚠️ {t('status.overdue')}</div>
                            )}
                          </td>
                          <td>{r.village}</td>
                          <td>
                            <span className={`badge ${r.classification === 'faux' ? 'badge-danger' : 'badge-info'}`}>
                              {r.classification || '-'}
                            </span>
                          </td>
                          <td>{getStatusBadge(r)}</td>
                          <td>
                            {r.directorDecision ? (
                              <span style={{ fontWeight: 700, color: 'var(--primary)' }}>🔒 {r.directorDecision}</span>
                            ) : (
                              <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button className="btn-primary btn-sm" onClick={() => handleDecision(r._id, 'prise_en_charge')}>{t('director.decision.care')}</button>
                                <button className="btn-warning btn-sm" onClick={() => handleDecision(r._id, 'sanction')}>{t('director.decision.sanction')}</button>
                                <button className="btn-secondary btn-sm" onClick={() => handleDecision(r._id, 'suivi')}>{t('director.decision.monitor')}</button>
                                <button className="btn-ghost btn-sm" onClick={() => handleDecision(r._id, 'archive')}>{t('director.decision.archive')}</button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardDirector;