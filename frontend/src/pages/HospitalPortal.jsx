import React, { useState, useEffect } from 'react'
import API from '../api'

export default function HospitalPortal() {
  const [matches, setMatches] = useState([])
  const [donors, setDonors] = useState([])
  const [originalDonors, setOriginalDonors] = useState([])
  const [requests, setRequests] = useState([])
  const [activeTab, setActiveTab] = useState('dashboard')
  const [loading, setLoading] = useState(true)
  const [selectedRequest, setSelectedRequest] = useState(null)

  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    try {
      const [donorsRes, requestsRes] = await Promise.all([
        API.get('/api/donors'),
        API.get('/api/requests')
      ])
      setDonors(donorsRes.data)
      setOriginalDonors(donorsRes.data)
      setRequests(requestsRes.data)
      setLoading(false)
    } catch (err) {
      console.error('Error fetching data:', err)
      setLoading(false)
    }
  }

  const findMatches = async (requestId) => {
    try {
      const request = requests.find(r => r.id === requestId)
      const res = await API.post('/api/ai/match-donors', {
        blood_group: request.blood_type || '',
        organ: request.organ_needed || '',
        location: '' // Can be enhanced if request.location exists
      })
      const aiMatches = (res.data.matches || []).map(d => ({
        ...d,
        blood_type: d.blood_group || d.blood_type
      }))
      setMatches(aiMatches)
      setSelectedRequest(request)
    } catch (err) {
      console.error('Error finding matches with AI:', err)
      // Fallback
      const request = requests.find(r => r.id === requestId)
      const organDonors = donors.filter(d => 
        d.organs?.includes(request.organ_needed) &&
        d.blood_type === request.blood_type
      )
      setMatches(organDonors)
      setSelectedRequest(request)
    }
  }

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{
        background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
        color: 'white',
        padding: '2rem',
        borderRadius: '10px',
        marginBottom: '2rem'
      }}>
        <h1 style={{ margin: 0, marginBottom: '0.5rem' }}>🏥 Hospital Portal</h1>
        <p style={{ margin: 0, opacity: 0.9 }}>Manage organ requests and find perfect donor matches</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{
          background: '#fff',
          padding: '1.5rem',
          borderRadius: '10px',
          textAlign: 'center',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          borderTop: '3px solid #2563eb'
        }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2563eb' }}>{donors.length}</div>
          <div style={{ fontSize: '0.9rem', color: '#666' }}>Active Donors</div>
        </div>

        <div style={{
          background: '#fff',
          padding: '1.5rem',
          borderRadius: '10px',
          textAlign: 'center',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          borderTop: '3px solid #e74c3c'
        }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#e74c3c' }}>{requests.length}</div>
          <div style={{ fontSize: '0.9rem', color: '#666' }}>Organ Requests</div>
        </div>

        <div style={{
          background: '#fff',
          padding: '1.5rem',
          borderRadius: '10px',
          textAlign: 'center',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          borderTop: '3px solid #27ae60'
        }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#27ae60' }}>
            {matches.length}
          </div>
          <div style={{ fontSize: '0.9rem', color: '#666' }}>Matches Found</div>
        </div>

        <div style={{
          background: '#fff',
          padding: '1.5rem',
          borderRadius: '10px',
          textAlign: 'center',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          borderTop: '3px solid #f39c12'
        }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f39c12' }}>
            {requests.filter(r => r.urgency === 'critical').length}
          </div>
          <div style={{ fontSize: '0.9rem', color: '#666' }}>Critical Cases</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '1rem' }}>
        {['dashboard', 'requests', 'donors', 'matches'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '0.75rem 1.5rem',
              background: activeTab === tab ? '#2563eb' : '#e2e8f0',
              color: activeTab === tab ? 'white' : '#4a5568',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontWeight: 'bold',
              textTransform: 'capitalize'
            }}
          >
            {tab === 'dashboard' && '📊 Dashboard'}
            {tab === 'requests' && '📋 Requests'}
            {tab === 'donors' && '💚 Donors'}
            {tab === 'matches' && '🔗 Matches'}
          </button>
        ))}
      </div>

      {activeTab === 'dashboard' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '2rem' }}>
          <div style={{
            background: '#fff',
            padding: '2rem',
            borderRadius: '10px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ marginTop: 0 }}>Recent Requests</h3>
            {requests.slice(0, 5).map((req, idx) => (
              <div key={idx} style={{
                padding: '1rem',
                background: '#f7fafc',
                borderRadius: '5px',
                marginBottom: '0.75rem',
                borderLeft: req.urgency === 'critical' ? '3px solid #e74c3c' : '3px solid #2563eb'
              }}>
                <div style={{ fontWeight: 'bold' }}>Organ: {req.organ_needed}</div>
                <div style={{ fontSize: '0.85rem', color: '#718096', marginTop: '0.25rem' }}>
                  Status: <span style={{ fontWeight: 'bold', color: req.urgency === 'critical' ? '#e74c3c' : '#2563eb' }}>
                    {req.urgency.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div style={{
            background: '#fff',
            padding: '2rem',
            borderRadius: '10px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ marginTop: 0 }}>Donor Blood Types</h3>
            {['O+', 'A+', 'B+', 'AB+'].map((bt) => {
              const count = donors.filter(d => d.blood_type === bt).length
              const percentage = donors.length > 0 ? Math.round((count / donors.length) * 100) : 0
              return (
                <div key={bt} style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span>{bt}</span>
                    <span style={{ fontWeight: 'bold' }}>{count}</span>
                  </div>
                  <div style={{
                    background: '#e2e8f0',
                    height: '8px',
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      background: '#2563eb',
                      height: '100%',
                      width: `${percentage}%`
                    }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {activeTab === 'requests' && (
        <div style={{
          background: '#fff',
          padding: '2rem',
          borderRadius: '10px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ marginTop: 0 }}>Organ Requests</h2>
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {requests.map((req, idx) => (
              <div key={idx} style={{
                padding: '1.5rem',
                background: '#f7fafc',
                borderRadius: '8px',
                borderLeft: '4px solid #2563eb'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div>
                    <h3 style={{ margin: 0, marginBottom: '0.5rem' }}>Organ: {req.organ_needed}</h3>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        background: '#e2e8f0',
                        borderRadius: '20px',
                        fontSize: '0.85rem'
                      }}>
                        Blood: {req.blood_type}
                      </span>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        background: req.urgency === 'critical' ? '#fadbd8' : '#d5f4e6',
                        color: req.urgency === 'critical' ? '#922b21' : '#186a3b',
                        borderRadius: '20px',
                        fontSize: '0.85rem',
                        fontWeight: 'bold'
                      }}>
                        {req.urgency.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <button onClick={() => findMatches(req.id)} style={{
                    padding: '0.5rem 1rem',
                    background: '#2563eb',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}>
                    Find Matches
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'donors' && (
        <div style={{
          background: '#fff',
          padding: '2rem',
          borderRadius: '10px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ margin: 0 }}>Active Donors</h2>
            <input
              type="text"
              placeholder="AI Smart Search (e.g. 'O+ near Bangalore')"
              onKeyDown={async (e) => {
                if (e.key === 'Enter') {
                  const val = e.target.value
                  if (!val) { setDonors(originalDonors); return; }
                  try {
                    const res = await API.post('/api/ai/smart-search', { query: val })
                    const mapped = (res.data.results || []).map(d => ({...d, blood_type: d.blood_group || d.blood_type}))
                    setDonors(mapped)
                  } catch(err) {
                    console.error(err)
                  }
                }
              }}
              style={{ width: '300px', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {donors.map((donor, idx) => (
              <div key={idx} style={{
                padding: '1.5rem',
                background: '#f7fafc',
                borderRadius: '8px',
                borderLeft: '4px solid #27ae60'
              }}>
                <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Donor #{idx + 1}</div>
                <div style={{ fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                  <strong>Blood:</strong> {donor.blood_type || 'N/A'}
                </div>
                <div style={{ fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                  <strong>Health:</strong> {donor.health_status || 'N/A'}
                </div>
                <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  <strong>Organs:</strong> {donor.organs?.length || 0}
                </div>
                {donor.organs && donor.organs.length > 0 && (
                  <div style={{
                    padding: '0.75rem',
                    background: '#fff',
                    borderRadius: '5px',
                    fontSize: '0.85rem'
                  }}>
                    {donor.organs.map((organ, i) => (
                      <span key={i} style={{
                        display: 'inline-block',
                        padding: '0.25rem 0.5rem',
                        background: '#d5f4e6',
                        color: '#186a3b',
                        borderRadius: '3px',
                        marginRight: '0.25rem',
                        marginBottom: '0.25rem'
                      }}>
                        {organ}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'matches' && (
        <div style={{
          background: '#fff',
          padding: '2rem',
          borderRadius: '10px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ marginTop: 0 }}>
            {selectedRequest ? `Matches for ${selectedRequest.organ_needed}` : 'Select Request to Find Matches'}
          </h2>
          
          {matches.length > 0 ? (
            <div style={{ display: 'grid', gap: '1.5rem' }}>
              {matches.map((donor, idx) => (
                <div key={idx} style={{
                  padding: '1.5rem',
                  background: '#f0f9ff',
                  borderRadius: '8px',
                  borderLeft: '4px solid #2563eb'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                    <div>
                      <h3 style={{ margin: 0, marginBottom: '0.5rem' }}>Perfect Match!</h3>
                      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        <span style={{
                          padding: '0.5rem 1rem',
                          background: '#dbeafe',
                          borderRadius: '20px',
                          fontSize: '0.9rem',
                          fontWeight: 'bold'
                        }}>
                          Blood: {donor.blood_type}
                        </span>
                        <span style={{
                          padding: '0.5rem 1rem',
                          background: '#dcfce7',
                          borderRadius: '20px',
                          fontSize: '0.9rem',
                          fontWeight: 'bold'
                        }}>
                          Score: 95%
                        </span>
                      </div>
                    </div>
                    <button style={{
                      padding: '0.5rem 1rem',
                      background: '#27ae60',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      fontWeight: 'bold'
                    }}>
                      Confirm
                    </button>
                  </div>

                  <div style={{
                    padding: '1rem',
                    background: '#fff',
                    borderRadius: '5px',
                    marginTop: '1rem'
                  }}>
                    <div style={{ marginBottom: '0.5rem' }}>
                      <strong>Organs:</strong> {donor.organs?.join(', ')}
                    </div>
                    <div>
                      <strong>Health:</strong> {donor.health_status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#718096' }}>
              <p>No matches found</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
