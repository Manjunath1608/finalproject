import React, { useState } from 'react';
import API from '../api';

export default function EligibilityChecker() {
  const [form, setForm] = useState({
    age: '',
    weight: '',
    health_conditions: ''
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.post('/api/ai/eligibility', {
        age: parseInt(form.age),
        weight: parseFloat(form.weight),
        health_conditions: form.health_conditions
      });
      setResult(res.data);
    } catch (err) {
      console.error('Eligibility check error:', err);
      setResult({ eligible: false, message: 'Failed to verify eligibility. Please try again later.', reasons: [] });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{
        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        color: 'white',
        padding: '2rem',
        borderRadius: '10px',
        marginBottom: '2rem',
        textAlign: 'center'
      }}>
        <h1 style={{ margin: 0, marginBottom: '0.5rem' }}>AI Eligibility Checker</h1>
        <p style={{ margin: 0, opacity: 0.9 }}>Instantly check if you qualify to donate blood or organs.</p>
      </div>

      <div className="card" style={{ padding: '2rem', background: '#fff', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Age (Years)</label>
            <input 
              type="number" 
              required
              min="1"
              max="120"
              value={form.age}
              onChange={(e) => setForm({...form, age: e.target.value})}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Weight (kg)</label>
            <input 
              type="number" 
              required
              min="1"
              max="300"
              value={form.weight}
              onChange={(e) => setForm({...form, weight: e.target.value})}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Health Conditions (if any, comma separated)</label>
            <input 
              type="text" 
              placeholder="e.g., Asthma, Diabetes (Optional)"
              value={form.health_conditions}
              onChange={(e) => setForm({...form, health_conditions: e.target.value})}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            style={{
              padding: '1rem',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 'bold',
              fontSize: '1rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s'
            }}
          >
            {loading ? 'Checking...' : 'Check Eligibility'}
          </button>
        </form>

        {result && (
          <div style={{
            marginTop: '2rem',
            padding: '1.5rem',
            borderRadius: '8px',
            backgroundColor: result.eligible ? '#ecfdf5' : '#fef2f2',
            border: `1px solid ${result.eligible ? '#34d399' : '#f87171'}`
          }}>
            <h3 style={{
              margin: '0 0 1rem 0',
              color: result.eligible ? '#059669' : '#dc2626',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              {result.eligible ? '✅ You are Eligible!' : '❌ Not Eligible at this time'}
            </h3>
            <p style={{ margin: '0 0 1rem 0', color: '#334155' }}>
              {result.message}
            </p>
            {result.reasons && result.reasons.length > 0 && (
              <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#dc2626' }}>
                {result.reasons.map((reason, idx) => (
                  <li key={idx} style={{ marginBottom: '0.25rem' }}>{reason}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
