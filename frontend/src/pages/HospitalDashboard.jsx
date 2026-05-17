import React, { useState, useEffect } from 'react';
import API from '../api';
import Sidebar from '../components/hospital/Sidebar';
import DashboardHome from '../components/hospital/DashboardHome';
import RaiseRequest from '../components/hospital/RaiseRequest';
import ActiveRequests from '../components/hospital/ActiveRequests';
import DonorMatching from '../components/hospital/DonorMatching';
import DonationHistory from '../components/hospital/DonationHistory';
import BlockchainLogs from '../components/hospital/BlockchainLogs';
import Notifications from '../components/hospital/Notifications';
import ProfileSettings from '../components/hospital/ProfileSettings';
import '../components/hospital/HospitalPortal.css'; // Ensure CSS is imported

export default function HospitalDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [requests, setRequests] = useState([]);
  const [donors, setDonors] = useState([]); // Inventory/Donors
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ total: 0, pending: 0, matched: 0, fulfilled: 0 });

  useEffect(() => {
    fetchData();
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const res = await API.get('/api/auth/me');
      setUser(res.data);
    } catch (err) {
      console.error("Error fetching user", err);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [reqRes, donRes] = await Promise.all([
        API.get('/api/requests'),
        API.get('/api/donors')
      ]);

      setRequests(reqRes.data);
      setDonors(donRes.data);

      // Calc stats
      const s = { total: reqRes.data.length, pending: 0, matched: 0, fulfilled: 0 };
      reqRes.data.forEach(r => {
        if (r.status === 'fulfilled' || r.status === 'completed') s.fulfilled++;
        else if (r.status === 'matched' || (r.matches && r.matches.length > 0)) s.matched++;
        else s.pending++;
      });
      setStats(s);

    } catch (err) {
      console.error("Error fetching data", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  const handleCancelRequest = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this request?")) return;
    try {
      await API.delete(`/api/requests/${id}`);
      fetchData();
    } catch (e) {
      console.error(e);
      alert("Failed to cancel the request.");
    }
  };

  // Helper to switch tabs
  const handleViewMatches = () => setActiveTab('matched-donors');
  const handleAfterRequest = () => {
    fetchData();
    setActiveTab('active-requests');
  };

  if (loading) {
    return (
      <div className="hp-container" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div className="hp-header">Loading Hospital Portal...</div>
      </div>
    );
  }

  return (
    <div className="hp-container">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} />

      <main className="hp-main">
        {activeTab === 'dashboard' && <DashboardHome stats={stats} recentActivity={[]} />}

        {activeTab === 'raise-request' && <RaiseRequest onBack={() => setActiveTab('dashboard')} />}

        {activeTab === 'active-requests' && (
          <ActiveRequests
            requests={requests}
            onCancel={handleCancelRequest}
            onViewMatches={handleViewMatches}
          />
        )}

        {activeTab === 'matched-donors' && (
          <DonorMatching
            requests={requests}
            onRequestUpdate={fetchData}
          />
        )}

        {activeTab === 'history' && <DonationHistory requests={requests} />}

        {activeTab === 'blockchain' && <BlockchainLogs requests={requests} />}

        {activeTab === 'notifications' && <Notifications />}

        {activeTab === 'analytics' && <DashboardHome stats={stats} recentActivity={[]} />} {/* Reusing Home for now or separate component */}

        {activeTab === 'profile' && <ProfileSettings user={user} />}

        {activeTab === 'emergency' && (
          <div className="hp-card" style={{ borderLeft: '5px solid red' }}>
            <h1>🚨 Emergency Request</h1>
            <p>Module for triggering high-priority broadcast alerts.</p>
            <RaiseRequest /> {/* Reusing raise request but could pre-fill urgency */}
          </div>
        )}
      </main>
    </div>
  );
}
