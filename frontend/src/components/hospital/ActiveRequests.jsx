import React from 'react';
import './HospitalPortal.css';

export default function ActiveRequests({ requests, onCancel, onViewMatches }) {
    // Filter out fulfilled/history requests if needed, but the prompt says 
    // "Active Requests" vs "Donation History". 
    // So I assume 'requests' passed here are active ones.
    const activeRequests = requests.filter(r => r.status !== 'fulfilled' && r.status !== 'cancelled');

    const getUrgencyBadge = (urgency) => {
        let color = 'info';
        if (urgency === 'critical') color = 'danger';
        if (urgency === 'high') color = 'warning';
        if (urgency === 'low') color = 'success';
        return <span className={`hp-badge hp-badge-${color}`}>{urgency.toUpperCase()}</span>;
    };

    const getStatusStep = (status) => {
        // Simple stepper logic
        const steps = ['pending', 'approved', 'matched', 'scheduled', 'completed'];
        const currentIdx = steps.indexOf(status) > -1 ? steps.indexOf(status) : 0;
        return (
            <div className="hp-stepper" style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                {steps.slice(0, 4).map((step, idx) => ( // Show first 4 steps
                    <div key={step} style={{
                        flex: 1,
                        height: '4px',
                        background: idx <= currentIdx ? 'var(--hp-success)' : 'var(--hp-border)',
                        borderRadius: '2px'
                    }} title={step}></div>
                ))}
            </div>
        );
    };

    return (
        <div className="hp-animate-fade">
            <div className="hp-header">
                <div>
                    <h1 className="hp-title">Active Requests</h1>
                    <p className="hp-subtitle">Track and manage patient requirements</p>
                </div>
                <div className="hp-search-box">
                    <input className="hp-input" placeholder="Search by patient or ID..." style={{ width: '300px' }} />
                </div>
            </div>

            {activeRequests.length === 0 ? (
                <div className="hp-card" style={{ textAlign: 'center', padding: '3rem' }}>
                    <h3>No Active Requests</h3>
                    <p style={{ color: 'var(--hp-text-muted)' }}>Create a new request to get started.</p>
                </div>
            ) : (
                <div className="hp-grid" style={{ gridTemplateColumns: '1fr' }}>
                    {activeRequests.map(req => (
                        <div key={req.id || req._id} className="hp-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                                    <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#1e293b' }}>
                                        {req.patient_name || "Unknown Patient"}
                                    </h3>
                                    {getUrgencyBadge(req.urgency)}
                                    <span style={{ fontSize: '0.85rem', color: 'var(--hp-text-muted)', background: '#f1f5f9', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                                        ID: {req.id ? req.id.slice(-6) : '...'}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', gap: '2rem', color: 'var(--hp-text)', fontSize: '0.95rem' }}>
                                    <div><strong>Organ:</strong> {req.organ}</div>
                                    <div><strong>Blood Group:</strong> {req.blood_group}</div>
                                    <div><strong>Age:</strong> {req.patient_age}</div>
                                    <div><strong>Date:</strong> {req.required_date || 'ASAP'}</div>
                                </div>
                                <div style={{ marginTop: '1rem', width: '60%' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--hp-text-muted)', marginBottom: '0.25rem' }}>
                                        <span>Status: <strong>{req.status ? req.status.toUpperCase() : 'PENDING'}</strong></span>
                                        <span>{req.matches ? req.matches.length : 0} Potential Matches</span>
                                    </div>
                                    {getStatusStep(req.status)}
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: '150px' }}>
                                {(req.matches && req.matches.length > 0) ? (
                                    <button
                                        className="hp-btn hp-btn-primary"
                                        onClick={() => onViewMatches(req)}
                                    >
                                        View Matches ({req.matches.length})
                                    </button>
                                ) : (
                                    <button className="hp-btn hp-btn-outline" disabled style={{ opacity: 0.6 }}>
                                        Scanning for Donors...
                                    </button>
                                )}
                                <button className="hp-btn hp-btn-outline" style={{ color: 'var(--hp-danger)', borderColor: 'var(--hp-danger)' }} onClick={() => onCancel(req.id || req._id)}>
                                    Cancel Request
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
