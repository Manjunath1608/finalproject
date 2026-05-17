import React, { useState, useEffect } from 'react';
import API from '../../api';
import './DonorPortal.css';

export default function DashboardHome({ donor, stats, onQuickAction }) {
    const [alerts, setAlerts] = useState([]);

    useEffect(() => {
        if (donor && (donor.blood_type || donor.blood_group)) {
            API.get('/api/ai/trigger-alerts')
                .then(res => {
                    const allAlerts = res.data.alerts || [];
                    const myAlerts = allAlerts.filter(a => {
                        const isBloodMatch = a.blood_group === donor.blood_type || a.blood_group === donor.blood_group;
                        
                        let isOrganMatch = true;
                        if (a.organ && a.organ.trim() !== '' && a.organ.toLowerCase() !== 'none') {
                            if (a.organ.toLowerCase() === 'whole blood') {
                                isOrganMatch = donor.donate_blood === true;
                            } else {
                                const donorOrgans = (donor.organs || []).map(o => o.toLowerCase());
                                isOrganMatch = donorOrgans.includes(a.organ.toLowerCase());
                            }
                        }
                        
                        let isAlreadyVolunteered = false;
                        if (a.matches && Array.isArray(a.matches)) {
                            isAlreadyVolunteered = a.matches.some(m => m.donor_id === (donor.user_id || donor.id || donor._id));
                        }

                        return isBloodMatch && isOrganMatch && !isAlreadyVolunteered;
                    });
                    setAlerts(myAlerts);
                })
                .catch(err => console.error(err));
        }
    }, [donor]);

    if (!donor) return <div className="dp-animate-fade">Loading...</div>;

    return (
        <div className="dp-animate-fade">
            <div className="dp-header">
                <div>
                    <h1 className="dp-title">Welcome, {donor.first_name}! 👋</h1>
                    <p className="dp-subtitle">Thank you for being a hero. Here's your impact overview.</p>
                </div>
                <div className={`dp-badge ${donor.availability ? 'success' : 'warning'}`} style={{ fontSize: '1rem', padding: '0.5rem 1rem' }}>
                    {donor.availability ? '✅ Available to Donate' : '⏸️ Temporarily Unavailable'}
                </div>
            </div>

            <div className="dp-grid">
                <div className="dp-stat-card">
                    <div className="dp-stat-icon" style={{ background: 'rgba(255, 71, 87, 0.1)', color: '#ff4757' }}>🩸</div>
                    <div className="dp-stat-info">
                        <h3>{stats?.totalDonations || 0}</h3>
                        <p>Total Donations</p>
                    </div>
                </div>
                <div className="dp-stat-card">
                    <div className="dp-stat-icon" style={{ background: 'rgba(46, 213, 115, 0.1)', color: '#2ed573' }}>❤️</div>
                    <div className="dp-stat-info">
                        <h3>{stats?.livesSaved || 0}</h3>
                        <p>Lives Impacted</p>
                    </div>
                </div>
                <div className="dp-stat-card">
                    <div className="dp-stat-icon" style={{ background: 'rgba(30, 144, 255, 0.1)', color: '#1e90ff' }}>🚑</div>
                    <div className="dp-stat-info">
                        <h3>{stats?.pendingRequests || 0}</h3>
                        <p>Urgent Matches</p>
                    </div>
                </div>
                <div className="dp-stat-card">
                    <div className="dp-stat-icon" style={{ background: 'rgba(255, 165, 2, 0.1)', color: '#ffa502' }}>⏳</div>
                    <div className="dp-stat-info">
                        <h3>{donor.last_donation ? donor.last_donation : 'None'}</h3>
                        <p>Last Donation</p>
                    </div>
                </div>
            </div>

            {alerts.length > 0 && (
                <div style={{ marginBottom: '2rem', animation: 'fadeInUp 0.5s ease-out' }}>
                    <h2 className="dp-title" style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#ff4757', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>⚠️ URGENT AI Alerts</h2>
                    {alerts.map((alert, idx) => (
                        <div key={idx} style={{ padding: '1.5rem', background: '#fee2e2', borderRadius: '10px', borderLeft: '6px solid #dc2626', marginBottom: '1rem', color: '#7f1d1d', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                            <div style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{alert.message}</div>
                            <div style={{ fontSize: '0.9rem' }}>Your profile matches an urgent request. Please check Active Requests to find and accept the match.</div>
                        </div>
                    ))}
                </div>
            )}

            <h2 className="dp-title" style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Start Saving Lives</h2>
            <div className="dp-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                <div className="dp-card" style={{ textAlign: 'center', cursor: 'pointer' }} onClick={() => onQuickAction('donate-blood')}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🩸</div>
                    <h3>Donate Blood</h3>
                    <p className="dp-subtitle">Schedule a blood donation</p>
                </div>
                <div className="dp-card" style={{ textAlign: 'center', cursor: 'pointer' }} onClick={() => onQuickAction('donate-organ')}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🫀</div>
                    <h3>Donate Organs</h3>
                    <p className="dp-subtitle">Register for organ donation</p>
                </div>
                <div className="dp-card" style={{ textAlign: 'center', cursor: 'pointer' }} onClick={() => onQuickAction('active-requests')}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
                    <h3>Find Matches</h3>
                    <p className="dp-subtitle">View urgent requests near you</p>
                </div>
            </div>
        </div>
    );
}
