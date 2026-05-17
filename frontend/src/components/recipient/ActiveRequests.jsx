import React from 'react';
import API from '../../api';

export default function ActiveRequests({ requests, onCancel }) {
    const activeRequests = requests.filter(r => r.status !== 'fulfilled' && r.status !== 'cancelled');

    return (
        <div className="rp-animate-fade">
            <div className="rp-header">
                <div>
                    <h1 className="rp-title">Active Requests</h1>
                    <p className="rp-subtitle">Track the status of your ongoing requests.</p>
                </div>
            </div>

            {activeRequests.length === 0 ? (
                <div className="rp-card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--rp-muted)' }}>
                    <h3>No active requests found.</h3>
                    <p>Submit a request to see it here.</p>
                </div>
            ) : (
                <div className="rp-grid">
                    {activeRequests.map(req => (
                        <div key={req.id || req._id} className="rp-card" style={{ position: 'relative', overflow: 'hidden' }}>
                            <div style={{
                                position: 'absolute', top: 0, left: 0, width: '4px', height: '100%',
                                background: req.urgency === 'critical' ? 'var(--rp-danger)' :
                                    req.urgency === 'high' ? 'var(--rp-warning)' : 'var(--rp-info)'
                            }} />

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                <span className={`rp-badge ${req.urgency === 'critical' ? 'danger' : 'info'}`}>
                                    {req.urgency}
                                </span>
                                <span className={`rp-badge ${req.status === 'matched' ? 'success' : 'warning'}`}>
                                    {req.status}
                                </span>
                            </div>

                            <h3 style={{ margin: '0 0 0.5rem' }}>{req.organ} / {req.blood_group}</h3>
                            <p style={{ margin: '0 0 1rem', fontSize: '0.9rem', color: 'var(--rp-text)' }}>
                                <strong>Patient:</strong> {req.patient_name} (Age: {req.age})<br />
                                <strong>Location:</strong> {req.hospital_location}<br />
                                <strong>Required By:</strong> {req.required_date}
                            </p>

                            {req.matches && req.matches.length > 0 && (
                                <div style={{ background: '#e8f5e9', padding: '0.5rem', borderRadius: '6px', marginBottom: '1rem', color: '#2e7d32', fontSize: '0.9rem' }}>
                                    <strong>{req.matches.length} Potential Match(es) Found!</strong>
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button
                                    className="rp-btn rp-btn-secondary"
                                    style={{ flex: 1, borderColor: '#ff6b6b', color: '#ff6b6b' }}
                                    onClick={() => onCancel(req.id || req._id)}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
