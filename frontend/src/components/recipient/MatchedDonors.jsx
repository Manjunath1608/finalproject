import React, { useState, useEffect } from 'react';
import API from '../../api';

export default function MatchedDonors({ activeRequests, onAction }) {
    const [localRequests, setLocalRequests] = useState([]);

    useEffect(() => {
        setLocalRequests(activeRequests.filter(r => r.matches && r.matches.length > 0));
    }, [activeRequests]);

    const handleAccept = async (reqId, donorId) => {
        try {
            await API.put(`/api/requests/${reqId}/accept?donor_id=${donorId}`);
            alert(`Donor ${donorId} accepted for request ${reqId}. The hospital will be notified.`);
            removeMatch(reqId, donorId);
            if (onAction) onAction();
        } catch (err) {
            console.error("Error accepting match:", err);
            alert("Failed to accept donor.");
        }
    };

    const handleDecline = async (reqId, donorId) => {
        try {
            await API.put(`/api/requests/${reqId}/decline?donor_id=${donorId}`);
            removeMatch(reqId, donorId);
            if (onAction) onAction();
        } catch (err) {
            console.error("Error declining match:", err);
            alert("Failed to decline donor.");
        }
    };

    const removeMatch = (reqId, donorId) => {
        setLocalRequests(prev => {
            return prev.map(req => {
                if ((req.id || req._id) === reqId) {
                    return {
                        ...req,
                        matches: req.matches.filter(m => m.donor_id !== donorId)
                    };
                }
                return req;
            }).filter(req => req.matches.length > 0);
        });
    };

    return (
        <div className="rp-animate-fade">
            <div className="rp-header">
                <div>
                    <h1 className="rp-title">Matched Donors</h1>
                    <p className="rp-subtitle">Review and accept potential donors for your requests.</p>
                </div>
            </div>

            {localRequests.length === 0 ? (
                <div className="rp-card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--rp-muted)' }}>
                    <h3>No matches found yet.</h3>
                    <p>We are actively searching for compatible donors.</p>
                </div>
            ) : (
                <div>
                    {localRequests.map(req => (
                        <div key={req.id || req._id} style={{ marginBottom: '2rem' }}>
                            <h3 style={{ color: 'var(--rp-text)', borderBottom: '2px solid var(--rp-secondary)', paddingBottom: '0.5rem', display: 'inline-block' }}>
                                Matches for {req.organ} ({req.blood_group})
                            </h3>

                            <div className="rp-grid">
                                {req.matches.map((match, i) => (
                                    <div key={i} className="rp-card" style={{ border: '1px solid var(--rp-secondary)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                            <span className="rp-badge success">Recommend Match</span>
                                            <span style={{ fontWeight: 'bold', color: 'var(--rp-primary)' }}>{match.score || '98'}% Compatible</span>
                                        </div>

                                        <p style={{ lineHeight: '1.6' }}>
                                            <strong>Donor ID:</strong> {match.donor_id}<br />
                                            <strong>Blood Group:</strong> {match.blood_group}<br />
                                            <strong>Distance:</strong> {match.distance || '5 km'} away<br />
                                            <strong>Availability:</strong> {match.availability ? 'Immediate' : 'check'}
                                        </p>

                                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                                            <button
                                                className="rp-btn rp-btn-primary"
                                                style={{ flex: 1 }}
                                                onClick={() => handleAccept(req.id, match.donor_id)}
                                            >
                                                Accept
                                            </button>
                                            <button
                                                className="rp-btn rp-btn-secondary"
                                                style={{ flex: 1 }}
                                                onClick={() => handleDecline(req.id, match.donor_id)}
                                            >
                                                Decline
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
