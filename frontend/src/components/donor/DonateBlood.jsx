import React, { useState, useEffect } from 'react';
import API from '../../api';

export default function DonateBlood({ donor, onUpdate }) {
    const [formData, setFormData] = useState({
        blood_group: '',
        last_donation: '',
        health_status: '',
        address: '',
        donate_blood: true,
        availability: true
    });
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState('');

    useEffect(() => {
        if (donor) {
            setFormData({
                blood_group: donor.blood_group || '',
                last_donation: donor.last_donation || '',
                health_status: donor.health_status || 'Healthy',
                address: donor.address || '',
                donate_blood: true, // Force true since this is the blood donation form
                availability: donor.availability
            });
        }
    }, [donor]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMsg('');
        try {
            const fullDonorData = {
                ...donor,
                ...formData
            };
            if (!fullDonorData.last_donation) {
                fullDonorData.last_donation = null;
            }
            await API.put('/api/donors/me', fullDonorData);
            setMsg('✓ Blood donation profile updated successfully!');
            if (onUpdate) onUpdate();
        } catch (err) {
            console.error(err);
            setMsg('✗ Failed to update profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dp-animate-fade">
            <div className="dp-header">
                <div>
                    <h1 className="dp-title">Donate Blood</h1>
                    <p className="dp-subtitle">Update your blood donation eligibility and availability.</p>
                </div>
            </div>

            <div className="dp-card">
                {msg && (
                    <div className={`dp-badge ${msg.includes('✓') ? 'success' : 'danger'}`} style={{ marginBottom: '1rem', display: 'block', padding: '1rem', fontSize: '1rem' }}>
                        {msg}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="dp-grid">
                        <div className="dp-form-group">
                            <label className="dp-label">Blood Group</label>
                            <select
                                className="dp-select"
                                value={formData.blood_group}
                                onChange={e => setFormData({ ...formData, blood_group: e.target.value })}
                                required
                            >
                                <option value="">Select Group</option>
                                <option value="A+">A+</option>
                                <option value="A-">A-</option>
                                <option value="B+">B+</option>
                                <option value="B-">B-</option>
                                <option value="AB+">AB+</option>
                                <option value="AB-">AB-</option>
                                <option value="O+">O+</option>
                                <option value="O-">O-</option>
                            </select>
                        </div>

                        <div className="dp-form-group">
                            <label className="dp-label">Last Donation Date</label>
                            <input
                                type="date"
                                className="dp-input"
                                value={formData.last_donation}
                                onChange={e => setFormData({ ...formData, last_donation: e.target.value })}
                            />
                        </div>

                        <div className="dp-form-group">
                            <label className="dp-label">Current Health Status</label>
                            <select
                                className="dp-select"
                                value={formData.health_status}
                                onChange={e => setFormData({ ...formData, health_status: e.target.value })}
                            >
                                <option value="Healthy">Healthy (No recent illness)</option>
                                <option value="Recovering">Recovering (Recent cold/flu)</option>
                                <option value="Chronic Condition">Chronic Condition (Diabetic, hypertensive, etc.)</option>
                                <option value="Unwell">Unwell (Currently sick)</option>
                            </select>
                        </div>

                        <div className="dp-form-group">
                            <label className="dp-label">Current Location / City</label>
                            <input
                                type="text"
                                className="dp-input"
                                value={formData.address}
                                onChange={e => setFormData({ ...formData, address: e.target.value })}
                                required
                                placeholder="e.g. New York, NY"
                            />
                        </div>
                    </div>

                    <div className="dp-form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <input
                            type="checkbox"
                            id="availability"
                            checked={formData.availability}
                            onChange={e => setFormData({ ...formData, availability: e.target.checked })}
                            style={{ width: '20px', height: '20px' }}
                        />
                        <label htmlFor="availability" className="dp-label" style={{ marginBottom: 0 }}>
                            I am currently available to respond to donation requests.
                        </label>
                    </div>

                    <div className="dp-form-group">
                        <button type="submit" className="dp-btn dp-btn-primary" disabled={loading}>
                            {loading ? 'Updating...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>

            <div className="dp-card" style={{ background: '#e3f2fd', border: 'none' }}>
                <h3 style={{ color: '#1565c0', marginTop: 0 }}>🩸 Blood Donation Fact</h3>
                <p style={{ color: '#1e88e5' }}>
                    One blood donation can save up to three lives. Make sure you are hydrated and have eaten a healthy meal before donating.
                </p>
            </div>
        </div>
    );
}
