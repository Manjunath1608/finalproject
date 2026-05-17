import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import Sidebar from '../components/recipient/Sidebar';
import DashboardHome from '../components/recipient/DashboardHome';
import RequestBlood from '../components/recipient/RequestBlood';
import RequestOrgan from '../components/recipient/RequestOrgan';
import ActiveRequests from '../components/recipient/ActiveRequests';
import MatchedDonors from '../components/recipient/MatchedDonors';
import DonationHistory from '../components/recipient/DonationHistory';
import RecipientProfile from '../components/recipient/RecipientProfile';
import RecipientSettings from '../components/recipient/RecipientSettings';
import Notifications from '../components/recipient/Notifications';
import '../components/recipient/RecipientPortal.css';

export default function RecipientPortal() {
  const [user, setUser] = useState(null);
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState({ activeRequests: 0, matchesFound: 0, completedReqs: 0, notifications: 0 });
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
      if (authRes.data.role !== 'recipient') {
        // Strict check: if not recipient, maybe admin can view? 
        // For now, redirect if not recipient
        // navigate('/login');
        console.warn("User is not recipient: " + authRes.data.role);
      }
      setUser(authRes.data);

      // 2. Fetch Requests
      const reqRes = await API.get('/api/requests');
      setRequests(reqRes.data);

      // 3. Calc Stats
      const active = reqRes.data.filter(r => r.status === 'pending' || r.status === 'matched');
      const matches = reqRes.data.reduce((acc, r) => acc + (r.matches && r.matches.length > 0 ? r.matches.length : 0), 0);
      const completed = reqRes.data.filter(r => r.status === 'fulfilled' || r.status === 'completed');

      // Mock notifications count
      const notifRes = await API.get('/api/notifications');
      const unread = notifRes.data.filter(n => !n.is_read).length;

      setStats({
        activeRequests: active.length,
        matchesFound: matches,
        completedReqs: completed.length,
        notifications: unread
      });

    } catch (err) {
      console.error('Portal load error:', err);
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

  const refreshRequests = async () => {
    const res = await API.get('/api/requests');
    setRequests(res.data);
    // update stats?
    fetchData();
  };

  const handleCancelRequest = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this request?")) return;
    try {
      await API.delete(`/api/requests/${id}`); 
      refreshRequests();
    } catch (e) {
      console.error(e);
      alert("Failed to cancel the request.");
    }
  };

  if (loading) return (
    <div className="rp-container" style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div className="spinner"></div>
    </div>
  );

  return (
    <div className="rp-container">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
      />

      <div className="rp-main">
        {activeTab === 'dashboard' && (
          <DashboardHome
            user={user}
            stats={stats}
            onQuickAction={setActiveTab}
          />
        )}
        {activeTab === 'request-blood' && (
          <RequestBlood
            onForceRefresh={refreshRequests}
          />
        )}
        {activeTab === 'request-organ' && (
          <RequestOrgan
            onForceRefresh={refreshRequests}
          />
        )}
        {activeTab === 'active-requests' && (
          <ActiveRequests
            requests={requests}
            onCancel={handleCancelRequest}
          />
        )}
        {activeTab === 'matched-donors' && (
          <MatchedDonors
            activeRequests={requests}
            onAction={fetchData}
          />
        )}
        {activeTab === 'history' && (
          <DonationHistory
            requests={requests}
          />
        )}
        {activeTab === 'notifications' && (
          <Notifications />
        )}
        {activeTab === 'profile' && (
          <RecipientProfile
            user={user}
            requests={requests}
          />
        )}
        {activeTab === 'settings' && (
          <RecipientSettings
            user={user}
          />
        )}
      </div>
    </div>
  );
}
