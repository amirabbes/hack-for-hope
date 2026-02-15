import React, { useState } from 'react';
import axios from 'axios';

const AiAssistant = ({ reportId, description, incidentType }) => {
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(false);
    const [question, setQuestion] = useState('');
    const [chatResponse, setChatResponse] = useState('');

    const runAnalysis = async () => {
        setLoading(true);
        // Simulate AI Service call - In production, this would call specific endpoints
        setTimeout(() => {
            setAnalysis({
                riskScore: Math.floor(Math.random() * 40) + 60, // Simulate high risk
                riskReason: `Based on the incident type "${incidentType}" and keywords in the description, this case shows indicators of significant distress.`,
                recommendation: "Immediate extraction (Sauvegarde) recommended. Psychological evaluation required within 24h.",
                keyTopics: ["Physical Abuse", "High Urgency", "Family Conflict"]
            });
            setLoading(false);
        }, 1500);
    };

    const handleAsk = () => {
        if (!question) return;
        setLoading(true);
        setTimeout(() => {
            setChatResponse(`AI Response to "${question}": Based on similar cases in the SOS Tunisie database, effective interventions typically involve a joint meeting with the educator and a family mediator.`);
            setLoading(false);
            setQuestion('');
        }, 1000);
    };

    return (
        <div className="card" style={{ background: 'linear-gradient(135deg, #fff 0%, #f0f9ff 100%)', border: '1px solid #bae6fd' }}>
            <div className="card-header" style={{ borderBottomColor: '#bae6fd' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.2rem' }}>✨</span>
                    <h3 style={{ color: '#0369a1' }}>Assistant IA - SOS Helper</h3>
                </div>
            </div>

            {!analysis ? (
                <div style={{ textAlign: 'center', padding: '1rem' }}>
                    <p style={{ fontSize: '0.9rem', color: '#0369a1', marginBottom: '1rem' }}>
                        L'IA peut analyser ce dossier pour détecter les risques et suggérer des actions.
                    </p>
                    <button className="btn-primary" onClick={runAnalysis} disabled={loading} style={{ width: '100%' }}>
                        {loading ? 'Analyse en cours...' : '⚡ Lancer l\'analyse des risques'}
                    </button>
                </div>
            ) : (
                <div className="animate-in">
                    {/* Risk Score */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', padding: '0.75rem', background: '#fff', borderRadius: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                        <div style={{
                            width: '50px', height: '50px', borderRadius: '50%',
                            background: analysis.riskScore > 80 ? '#fee2e2' : '#fef3c7',
                            color: analysis.riskScore > 80 ? '#dc2626' : '#d97706',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: 800, fontSize: '1.1rem'
                        }}>
                            {analysis.riskScore}%
                        </div>
                        <div>
                            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>SCORE DE RISQUE</div>
                            <div style={{ fontWeight: 600, color: analysis.riskScore > 80 ? '#dc2626' : '#d97706' }}>
                                {analysis.riskScore > 80 ? 'CRITIQUE' : 'ÉLEVÉ'}
                            </div>
                        </div>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <h4 style={{ fontSize: '0.9rem', color: '#0369a1', marginBottom: '0.5rem' }}>Analyse</h4>
                        <p style={{ fontSize: '0.9rem', lineHeight: '1.5' }}>{analysis.riskReason}</p>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <h4 style={{ fontSize: '0.9rem', color: '#0369a1', marginBottom: '0.5rem' }}>Recommandation</h4>
                        <div style={{ background: '#ecfccb', padding: '0.75rem', borderRadius: '6px', fontSize: '0.9rem', color: '#365314', borderLeft: '3px solid #65a30d' }}>
                            {analysis.recommendation}
                        </div>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <h4 style={{ fontSize: '0.9rem', color: '#0369a1', marginBottom: '0.5rem' }}>Assistant Chat</h4>
                        {chatResponse && (
                            <div style={{ background: '#fff', padding: '0.75rem', borderRadius: '6px', fontSize: '0.9rem', marginBottom: '0.5rem', border: '1px solid #bae6fd' }}>
                                {chatResponse}
                            </div>
                        )}
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <input
                                type="text"
                                placeholder="Poser une question sur ce dossier..."
                                value={question}
                                onChange={(e) => setQuestion(e.target.value)}
                                style={{ fontSize: '0.85rem' }}
                            />
                            <button className="btn-secondary btn-sm" onClick={handleAsk} disabled={loading}>
                                Envoyer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AiAssistant;
