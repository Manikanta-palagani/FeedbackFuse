import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { formsAPI } from '../../services/api';
import Stats from './Stats';
import FormList from './FormList';
import LoadingSpinner from '../Layout/LoadingSpinner';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ forms: 0, responses: 0 });
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const [statsResponse, formsResponse] = await Promise.all([
        formsAPI.getStats(user.id),
        formsAPI.getUserForms(user.id)
      ]);

      setStats(statsResponse.data);
      setForms(formsResponse.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="dashboard">
      <div className="container">
        <div className="dashboard-header">
          <h1>Welcome back, {user.username}!</h1>
          <p>Manage your feedback forms and view analytics</p>
        </div>

        <Stats stats={stats} />
        <FormList forms={forms} onFormUpdate={fetchDashboardData} />
      </div>
    </div>
  );
};

export default Dashboard;