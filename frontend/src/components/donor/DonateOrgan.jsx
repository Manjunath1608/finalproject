import React, { useState, useEffect } from 'react';
import API from '../../api';

export default function DonateOrgan({ donor, onUpdate }) {
    const [formData, setFormData] = useState({
        organs: [], // Array of strings
        medical_history: '',
        consent_agreement: false,
        availability: true
    });
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState('');

    const availableOrgans = ['Kidney', 'Liver', 'Heart', 'Lungs', 'Corneas', 'Pancreas'];

    useEffect(() => {
        if (donor) {
            setFormData({
                organs: donor.organs || [],
                medical_history: donor.medical_history || '',
                consent_agreement: donor.consent_agreement || false,
                availability: donor.availability
            });
        }
    }, [donor]);

    const handleOrganToggle = (organ) => {
        const currentOrgans = [...formData.organs];
        if (currentOrgans.includes(organ)) {
            setFormData({ ...formData, organs: currentOrgans.filter(o => o !== organ) });
        } else {
            setFormData({ ...formData, organs: [...currentOrgans, organ] });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.consent_agreement) {
            setMsg('✗ You must agree to the consent terms to register.');
            return;
        }
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
            setMsg('✓ Organ donation preferences updated successfully!');
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
                    <h1 className="dp-title">Donate Organs</h1>
                    <p className="dp-subtitle">Register your pledge to donate organs and tissues.</p>
                </div>
            </div>

            <div className="dp-card">
                {msg && (
                    <div className={`dp-badge ${msg.includes('✓') ? 'success' : 'danger'}`} style={{ marginBottom: '1rem', display: 'block', padding: '1rem', fontSize: '1rem' }}>
                        {msg}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="dp-form-group">
                        <label className="dp-label" style={{ marginBottom: '1rem' }}>Select Organs to Pledge</label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem' }}>
                            {availableOrgans.map(organ => (
                                <div
                                    key={organ}
                                    onClick={() => handleOrganToggle(organ)}
                                    style={{
                                        padding: '1rem',
                                        borderRadius: '10px',
                                        border: `2px solid ${formData.organs.includes(organ) ? 'var(--dp-primary)' : 'var(--dp-border)'}`,
                                        background: formData.organs.includes(organ) ? 'rgba(255, 71, 87, 0.05)' : 'white',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        transition: 'all 0.2s',
                                        fontWeight: formData.organs.includes(organ) ? '600' : '400',
                                        color: formData.organs.includes(organ) ? 'var(--dp-primary)' : 'inherit'
                                    }}
                                >
                                    {formData.organs.includes(organ) ? '✅' : '⚪'} {organ}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="dp-form-group">
                        <label className="dp-label">Brief Medical History</label>
                        <textarea
                            className="dp-textarea"
                            rows="4"
                            value={formData.medical_history}
                            onChange={e => setFormData({ ...formData, medical_history: e.target.value })}
                            placeholder="Please mention any major surgeries, chronic illnesses, or existing conditions..."
                        ></textarea>
                    </div>

                    <div className="dp-form-group" style={{ background: '#f8f9fa', padding: '1.5rem', borderRadius: '10px', border: '1px solid var(--dp-border)' }}>
                        <label className="dp-label" style={{ color: 'var(--dp-primary)', marginBottom: '1rem' }}>Consent Agreement</label>
                        <p style={{ fontSize: '0.9rem', color: 'var(--dp-muted)', marginBottom: '1rem' }}>
                            By checking the box below, I voluntary pledge to donate the selected organs/tissues for therapeutic purposes (transplantation) after my death. I understand that my family will be informed of this decision, and it is my responsibility to discuss my wish with them.
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <input
                                type="checkbox"
                                id="consent"
                                checked={formData.consent_agreement}
                                onChange={e => setFormData({ ...formData, consent_agreement: e.target.checked })}
                                style={{ width: '20px', height: '20px' }}
                            />
                            <label htmlFor="consent" className="dp-label" style={{ marginBottom: 0 }}>
                                I have read and agree to the terms above.
                            </label>
                        </div>
                    </div>

                    <div className="dp-form-group">
                        <button type="submit" className="dp-btn dp-btn-primary" disabled={loading}>
                            {loading ? 'Processing Pledge...' : 'Register Pledge'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
