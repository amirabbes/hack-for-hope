import React, { useEffect, useState } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import TopBar from '../components/TopBar';
import AiAssistant from '../components/AiAssistant';
import { useLanguage } from '../context/LanguageContext';

const WORKFLOW_STEPS = [
  { key: 'ficheInitiale', label: '1. Fiche initiale de signalement' },
  { key: 'rapportDPE', label: '2. Rapport DPE (Notif. Direction)' },
  { key: 'evaluationComplete', label: '3. Évaluation complète' },
  { key: 'planAction', label: "4. Plan d'action" },
  { key: 'rapportSuivi', label: '5. Rapport de suivi' },
  { key: 'rapportFinal', label: '6. Rapport final' },
  { key: 'avisCloture', label: '7. Avis de clôture' },
];

const DashboardPsychologist = () => {
  const { t } = useLanguage();
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState('');
  const [activeTab, setActiveTab] = useState('details');
  const [timeLeft, setTimeLeft] = useState(null);
  // State to hold the file selected for the current workflow step
  const [stepFile, setStepFile] = useState(null);

  useEffect(() => {
    fetchReports();
    const socket = io();
    socket.on('new-report', (data) => {
      alert(`🔔 Nouveau signalement: ${data.childName} (${data.urgency})`);
      fetchReports();
    });
    return () => socket.disconnect();
  }, []);

  useEffect(() => {
    if (selectedReport?.deadline && selectedReport.status === 'en_cours') {
      const updateTimer = () => {
        const now = new Date();
        const end = new Date(selectedReport.deadline);
        const diff = end - now;

        if (diff <= 0) {
          setTimeLeft('EXPIRED');
        } else {
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          setTimeLeft(`${hours}h ${minutes}m restants`);
        }
      };

      updateTimer();
      const interval = setInterval(updateTimer, 60000);
      return () => clearInterval(interval);
    } else {
      setTimeLeft(null);
    }
  }, [selectedReport]);

  const fetchReports = async () => {
    try {
      const response = await axios.get('/api/reports/prioritized');
      setReports(response.data);
    } catch (error) { console.error('Failed to fetch reports'); }
    finally { setLoading(false); }
  };

  const handleClassify = async (id, classification) => {
    try {
      await axios.put(`/api/reports/${id}/classify`, { classification });
      fetchReports();
      const updated = await axios.get('/api/reports/prioritized');
      setSelectedReport(updated.data.find(r => r._id === id));
    } catch (error) { alert('❌ Échec'); }
  };

  const handleWorkflowStep = async (id, step) => {
    const stepIdx = WORKFLOW_STEPS.findIndex(s => s.key === step);

    // Check previous step
    if (stepIdx > 0) {
      const prevKey = WORKFLOW_STEPS[stepIdx - 1].key;
      if (!selectedReport.workflow[prevKey].completed) {
        alert(`⛔ Vous devez d'abord compléter l'étape précédente.`);
        return;
      }
    }

    // Require Document Upload
    if (!stepFile) {
      alert('⛔ Vous devez IMPÉRATIVEMENT importer un fichier justificatif pour valider cette étape.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('document', stepFile);

      await axios.put(`/api/reports/${id}/workflow/${step}`, formData);
      const res = await axios.get('/api/reports/prioritized');
      setReports(res.data);
      setSelectedReport(res.data.find(r => r._id === id));
      setStepFile(null); // Reset file input
      alert('✅ Étape validée avec succès !');
    } catch (error) { alert('❌ Échec: ' + (error.response?.data?.message || 'Erreur')); }
  };

  const handleSaveNotes = async (id) => {
    try {
      await axios.put(`/api/reports/${id}/notes`, { notes });
      alert(t('psych.notes.save') + ' ✅');
    } catch (error) { alert('❌ Échec'); }
  };

  const getUrgencyBadge = (u) => {
    const map = { critical: 'badge-danger', high: 'badge-warning', medium: 'badge-info', low: 'badge-success' };
    return <span className={`badge ${map[u] || 'badge-neutral'}`}>{u}</span>;
  };

  return (
    <div className="app-layout">
      <TopBar role="psychologist" />
      <div className="page-content" style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 350px) 1fr', gap: '2rem', height: 'calc(100vh - 100px)' }}>

        {/* Queue */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '1rem' }}>
          <div className="card-header">
            <div>
              <h3>{t('psych.queue.title')}</h3>
              <p className="subtitle">{reports.length} {t('psych.queue.subtitle')}</p>
            </div>
          </div>
          <div style={{ overflowY: 'auto', flex: 1, paddingRight: '0.5rem' }}>
            {loading ? <p>{t('loading')}</p> : reports.length === 0 ? (
              <div className="empty-state"><p>{t('mother.history.empty')}</p></div>
            ) : (
              reports.map(r => (
                <div key={r._id}
                  className={`queue-item ${selectedReport?._id === r._id ? 'active' : ''}`}
                  onClick={() => { setSelectedReport(r); setNotes(r.confidentialNotes || ''); setActiveTab('details'); }}
                  style={{ borderLeft: `4px solid ${r.urgency === 'critical' ? 'var(--danger)' : r.urgency === 'high' ? 'var(--warning)' : 'var(--success)'}` }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: 600 }}>{r.childFirstName} {r.childLastName}</span>
                    {getUrgencyBadge(r.urgency)}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {r.village} • {new Date(r.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Details */}
        <div className="card" style={{ height: '100%', overflowY: 'auto' }}>
          {selectedReport ? (
            <div className="animate-in">
              <div className="card-header">
                <div>
                  <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{selectedReport.childFirstName} {selectedReport.childLastName}</h2>
                  <p className="subtitle">ID: {selectedReport._id} • {selectedReport.village}</p>
                </div>
                {timeLeft && (
                  <div style={{
                    background: timeLeft === 'EXPIRED' ? 'var(--danger)' : 'var(--warning)',
                    color: 'white', padding: '0.5rem 1rem', borderRadius: '20px', fontWeight: 700
                  }}>
                    ⏱️ {timeLeft}
                  </div>
                )}
                {selectedReport.pdfPath && (
                  <button className="btn-secondary" onClick={() => window.open(`/uploads/${selectedReport.pdfPath.split(/[\\/]/).pop()}`, '_blank')}>
                    📄 Voir Rapport IA
                  </button>
                )}
              </div>

              <div className="tabs">
                <button className={`tab ${activeTab === 'details' ? 'active' : ''}`} onClick={() => setActiveTab('details')}>{t('psych.details')}</button>
                <button className={`tab ${activeTab === 'workflow' ? 'active' : ''}`} onClick={() => setActiveTab('workflow')}>{t('psych.workflow')}</button>
                <button className={`tab ${activeTab === 'notes' ? 'active' : ''}`} onClick={() => setActiveTab('notes')}>{t('psych.notes')}</button>
              </div>

              {activeTab === 'details' && (
                <div className="animate-in" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                  <div>
                    <div style={{ background: 'var(--primary-50)', padding: '1.5rem', borderRadius: 'var(--radius)', marginBottom: '2rem' }}>
                      <label>{t('psych.incident.desc')}</label>
                      <p style={{ fontStyle: 'italic', fontSize: '1.05rem', color: 'var(--primary-dark)' }}>"{selectedReport.incidentDescription}"</p>

                      {selectedReport.aiAnalysis && (
                        <div style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                          🤖 <strong>IA Confidence:</strong> {Math.round(selectedReport.aiAnalysis.confidence * 100)}%
                        </div>
                      )}

                      {/* Media Display */}
                      {selectedReport.attachments && selectedReport.attachments.length > 0 && (
                        <div style={{ marginTop: '1rem' }}>
                          <label>{t('psych.media')}</label>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                            {selectedReport.attachments.map((path, idx) => {
                              const fileName = path.split(/[\\/]/).pop();
                              return (
                                <a key={idx} href={`/uploads/${fileName}`} target="_blank" rel="noopener noreferrer" className="badge badge-info" style={{ textDecoration: 'none' }}>
                                  📎 Fichier {idx + 1}
                                </a>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
                      <div>
                        <label>{t('psych.incident.type')}</label>
                        <div style={{ fontWeight: 600 }}>{selectedReport.incidentType}</div>
                      </div>
                      <div>
                        <label>{t('psych.incident.abuser')}</label>
                        <div style={{ fontWeight: 600 }}>{selectedReport.abuserFirstName} {selectedReport.abuserLastName}</div>
                      </div>
                      <div>
                        <label>{t('psych.incident.anonymous')}</label>
                        <div style={{ fontWeight: 600 }}>{selectedReport.anonymous ? 'Oui' : 'Non'}</div>
                      </div>
                    </div>

                    <h3 className="section-title">{t('psych.action.required')}</h3>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                      <button className="btn-success btn-lg" style={{ flex: 1 }} onClick={() => handleClassify(selectedReport._id, 'sauvegarde')}>
                        {t('psych.action.save')}
                      </button>
                      <button className="btn-primary btn-lg" style={{ flex: 1 }} onClick={() => handleClassify(selectedReport._id, 'prise_en_charge')}>
                        {t('psych.action.care')}
                      </button>
                      <button className="btn-danger btn-lg" style={{ flex: 1 }} onClick={() => handleClassify(selectedReport._id, 'faux')}>
                        {t('psych.action.fake')}
                      </button>
                    </div>
                  </div>

                  <div style={{ minWidth: '300px' }}>
                    {/* AI Assistant Removed as requested */}
                  </div>
                </div>
              )}

              {activeTab === 'workflow' && (
                <div className="animate-in">
                  {selectedReport.classification !== 'sauvegarde' ? (
                    <div className="empty-state">
                      <p>Cette procédure est réservée aux cas classés "Sauvegarde".</p>
                    </div>
                  ) : (
                    WORKFLOW_STEPS.map((step, i) => {
                      const status = selectedReport.workflow?.[step.key];
                      const isDone = status?.completed;
                      const isNext = !isDone && (i === 0 || selectedReport.workflow?.[WORKFLOW_STEPS[i - 1].key]?.completed);

                      return (
                        <div key={step.key} className={`workflow-step ${isDone ? 'completed' : ''}`} style={{ opacity: isDone || isNext ? 1 : 0.5 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '100%' }}>
                            <div className={`step-number ${isDone ? 'done' : 'pending'}`}>{isDone ? '✓' : i + 1}</div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 600 }}>{step.label}</div>
                              {isDone && <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t('psych.workflow.done')} {new Date(status.date).toLocaleDateString()}</span>}
                              {isDone && status.document && (
                                <div style={{ marginTop: '0.25rem' }}>
                                  <a href={`/uploads/${status.document.split(/[\\/]/).pop()}`} target="_blank" className="badge badge-neutral">📄 Document joint</a>
                                </div>
                              )}
                            </div>
                            {isNext && (
                              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                <label className="btn-ghost btn-sm" style={{ cursor: 'pointer', margin: 0, border: stepFile ? '2px solid var(--success)' : '1px solid var(--border)' }}>
                                  {stepFile ? '📄 Fichier prêt' : t('psych.workflow.attach')}
                                  <input type="file" style={{ display: 'none' }} onChange={(e) => setStepFile(e.target.files[0])} />
                                </label>
                                <button className="btn-primary btn-sm" onClick={() => handleWorkflowStep(selectedReport._id, step.key)} disabled={!stepFile}>
                                  {t('psych.workflow.validate')}
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {activeTab === 'notes' && (
                <div className="animate-in">
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={t('psych.notes.placeholder')}
                    style={{ height: '300px', padding: '1.5rem', fontFamily: 'monospace', fontSize: '0.95rem' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                    <button className="btn-primary" onClick={() => handleSaveNotes(selectedReport._id)}>
                      {t('psych.notes.save')}
                    </button>
                  </div>
                </div>
              )}

            </div>
          ) : (
            <div className="empty-state" style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div className="icon">👈</div>
              <p>{t('mother.history.empty') || "Sélectionnez un dossier"}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPsychologist;