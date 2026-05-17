import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import Sidebar from '../components/donor/Sidebar';
import DashboardHome from '../components/donor/DashboardHome';
import DonateBlood from '../components/donor/DonateBlood';
import DonateOrgan from '../components/donor/DonateOrgan';
import ActiveRequests from '../components/donor/ActiveRequests';
import DonationHistory from '../components/donor/DonationHistory';
import Notifications from '../components/donor/Notifications';
import DonorProfile from '../components/donor/DonorProfile';
import DonorSettings from '../components/donor/DonorSettings';
import '../components/donor/DonorPortal.css';

export default function DonorDashboard() {
  const [user, setUser] = useState(null);
  const [donorProfile, setDonorProfile] = useState(null);
  const [stats, setStats] = useState({ totalDonations: 0, livesSaved: 0, pendingRequests: 0 });
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // 1. Auth check
      const authRes = await API.get('/api/auth/me');
      if (authRes.data.role !== 'donor') {
        navigate('/login');
        return;
      }
      setUser(authRes.data);

      // 2. Fetch Profile
      try {
        const profileRes = await API.get('/api/donors/me');
        setDonorProfile(profileRes.data);
      } catch (err) {
        if (err.response && err.response.status === 404) {
          navigate('/donor/setup'); // Redirect if no profile exists
          return;
        }
      }

      // 3. Fetch Stats (Parallel-ish)
      const historyRes = await API.get('/api/donors/history').catch(() => ({ data: [] }));
      const requestsRes = await API.get('/api/requests').catch(() => ({ data: [] }));

      const totalDonations = historyRes.data.length;
      const pendingMatch = requestsRes.data.filter(r => r.status === 'pending').length;

      setStats({
        totalDonations,
        livesSaved: totalDonations * 3, // Approximation
        pendingRequests: pendingMatch
      });

    } catch (err) {
      console.error('Dashboard load error:', err);
      // If unauthorized, the API interceptor might handle it, or we redirect
      // navigate('/login'); 
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    API.setToken(null);
    navigate('/login');
  };

  const refreshProfile = async () => {
    const res = await API.get('/api/donors/me');
    setDonorProfile(res.data);
  };

  if (loading) return (
    <div className="dp-container" style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div className="spinner"></div>
    </div>
  );

  return (
    <div className="dp-container">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
      />

      <div className="dp-main">
        {activeTab === 'dashboard' && (
          <DashboardHome
            donor={donorProfile}
            stats={stats}
            onQuickAction={setActiveTab}
          />
        )}
        {activeTab === 'donate-blood' && (
          <DonateBlood
            donor={donorProfile}
            onUpdate={refreshProfile}
          />
        )}
        {activeTab === 'donate-organ' && (
          <DonateOrgan
            donor={donorProfile}
            onUpdate={refreshProfile}
          />
        )}
        {activeTab === 'active-requests' && (
          <ActiveRequests
            donor={donorProfile}
            onAction={fetchData}
          />
        )}
        {activeTab === 'history' && (
          <DonationHistory
            donor={donorProfile}
          />
        )}
        {activeTab === 'notifications' && (
          <Notifications />
        )}
        {activeTab === 'profile' && (
          <DonorProfile
            donor={donorProfile}
          />
        )}
        {activeTab === 'settings' && (
          <DonorSettings
            donor={donorProfile}
            onUpdate={refreshProfile}
          />
        )}
      </div>
    </div>
  );
}
