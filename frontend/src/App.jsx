import React, { useState, useEffect } from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import Login from './pages/Login'
import DonorDashboard from './pages/DonorDashboard'
import HospitalDashboard from './pages/HospitalDashboard'
import AdminDashboard from './pages/AdminDashboard'
import UnifiedDashboard from './pages/UnifiedDashboard'
import DonorPortal from './pages/DonorPortal'
import RecipientPortal from './pages/RecipientPortal'
import HospitalPortal from './pages/HospitalPortal'
import LandingPage from './pages/LandingPage'
import Register from './pages/Register'
import DonorLogin from './pages/DonorLogin'
import RecipientLogin from './pages/RecipientLogin'
import HospitalLogin from './pages/HospitalLogin'
import AdminLogin from './pages/AdminLogin'
import DonorProfileSetup from './pages/DonorProfileSetup'
import EligibilityChecker from './pages/EligibilityChecker'
import ChatbotWidget from './components/ChatbotWidget'
import API from './api'

export default function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const location = useLocation()
  const isLoginPage = ['/login', '/', '/register', '/donor/setup'].includes(location.pathname) || location.pathname.startsWith('/login/')

  useEffect(() => {
    const checkUser = async () => {
      const token = localStorage.getItem('token')
      if (token) {
        API.setToken(token)
        try {
          const res = await API.get('/api/auth/me')
          setUser(res.data)
        } catch (err) {
          localStorage.removeItem('token')
        }
      }
      setLoading(false)
    }
    checkUser()
  }, [])

  const fetchUser = async () => {
    try {
      const res = await API.get('/api/auth/me')
      setUser(res.data)
    } catch (err) {
      localStorage.removeItem('token')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    setUser(null)
    API.setToken(null)
    window.location.href = '/login'
  }

  if (loading) return <div className="loading-spinner">Loading...</div>

  return (
    <div className="app">
      <ChatbotWidget />
      {!isLoginPage && (
        <header>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1>🩸 Smart Blood & Organ Donation</h1>
            {user && (
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', color: 'white' }}>
                <span style={{ fontSize: '0.9rem' }}>{user.email}</span>
                <span className="badge" style={{ background: 'rgba(255,255,255,0.3)', color: 'white' }}>{user.role}</span>
              </div>
            )}
          </div>
          {user && (
            <nav>
              {user.role === 'donor' && <Link to="/donor/dashboard">📊 Dashboard</Link>}
              {user.role === 'recipient' && <Link to="/recipient/dashboard">❤️ Portal</Link>}
              {user.role === 'hospital' && <Link to="/hospital/dashboard">🏥 Hospital</Link>}
              {user.role === 'admin' && <Link to="/admin/dashboard">🛡️ Admin</Link>}

              <button className="secondary" onClick={handleLogout} style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                🚪 Logout
              </button>
            </nav>
          )}
        </header>
      )}
      <main>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login onLoginSuccess={() => fetchUser()} />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login/donor" element={<DonorLogin />} />
          <Route path="/login/recipient" element={<RecipientLogin />} />
          <Route path="/login/hospital" element={<HospitalLogin />} />
          <Route path="/login/admin" element={<AdminLogin />} />

          {/* Secured Role Routes */}
          <Route path="/donor/dashboard" element={user && user.role === 'donor' ? <DonorDashboard /> : <Login onLoginSuccess={() => fetchUser()} />} />
          <Route path="/donor/setup" element={user && user.role === 'donor' ? <DonorProfileSetup /> : <Login onLoginSuccess={() => fetchUser()} />} />
          <Route path="/hospital/dashboard" element={user && user.role === 'hospital' ? <HospitalDashboard /> : <Login onLoginSuccess={() => fetchUser()} />} />
          <Route path="/admin/dashboard" element={user && user.role === 'admin' ? <AdminDashboard /> : <Login onLoginSuccess={() => fetchUser()} />} />
          <Route path="/recipient/dashboard" element={user && user.role === 'recipient' ? <RecipientPortal /> : <Login onLoginSuccess={() => fetchUser()} />} />

          <Route path="/dashboard" element={<UnifiedDashboard />} />
          <Route path="/eligibility" element={<EligibilityChecker />} />
        </Routes>
      </main>
    </div>
  )
}
