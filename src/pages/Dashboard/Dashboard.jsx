import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiDollarSign, FiEye, FiTarget, FiUsers } from 'react-icons/fi';
import DashboardLayout from '../../layouts/DashboardLayout';
import styles from './Dashboard.module.css';

const StatCard = ({ title, value, icon }) => (
  <div className={styles.statCard}>
    <div className={styles.statIcon}>{icon}</div>
    <div className={styles.statInfo}>
      <span className={styles.statTitle}>{title}</span>
      <span className={styles.statValue}>{value}</span>
    </div>
  </div>
);

const PerformanceChart = ({ data }) => {
  if (!data.length) {
    return <div className={styles.emptyChart}>No performance data available.</div>;
  }

  const width = 640;
  const height = 280;
  const padding = 32;
  const values = data.map((item) => Number(item.revenue) || 0);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const range = Math.max(maxValue - minValue, 1);

  const points = values
    .map((value, index) => {
      const x = padding + (index * (width - padding * 2)) / Math.max(data.length - 1, 1);
      const y = height - padding - ((value - minValue) * (height - padding * 2)) / range;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className={styles.chartSvg} role="img" aria-label="Funding performance chart">
      <defs>
        <linearGradient id="performanceFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4A90E2" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#4A90E2" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} className={styles.chartAxis} />
      <polyline points={`${points} ${width - padding},${height - padding} ${padding},${height - padding}`} className={styles.chartArea} />
      <polyline points={points} className={styles.chartLine} />
      {values.map((value, index) => {
        const x = padding + (index * (width - padding * 2)) / Math.max(data.length - 1, 1);
        const y = height - padding - ((value - minValue) * (height - padding * 2)) / range;

        return <circle key={`${data[index].week}-${index}`} cx={x} cy={y} r="4" className={styles.chartDot} />;
      })}
    </svg>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [performance, setPerformance] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const apiBaseUrl = useMemo(() => import.meta.env.VITE_API_URL || 'http://localhost:5000/api', []);
  const storedAuth = localStorage.getItem('empowerfund_auth');
  const auth = storedAuth ? JSON.parse(storedAuth) : null;

  useEffect(() => {
    const fetchData = async (endpoint) => {
      const response = await fetch(`${apiBaseUrl}/dashboard/${endpoint}`, {
        headers: { 'Authorization': `Bearer ${auth.token}` }
      });
      if (!response.ok) throw new Error(`Failed to fetch ${endpoint}`);
      return response.json();
    };

    const fetchAllData = async () => {
      try {
        setLoading(true);
        const [summaryData, performanceData, projectsData] = await Promise.all([
          fetchData('summary'),
          fetchData('performance'),
          fetchData('projects'),
        ]);
        setSummary(summaryData);
        setPerformance(performanceData);
        setProjects(projectsData);
      } catch (error) {
        console.error("Dashboard Error:", error);
      } finally {
        setLoading(false);
      }
    };

    if (auth?.token) {
      fetchAllData();
    }

    // Listen for investmentMade event to refetch dashboard data
    const handleInvestment = () => {
      if (auth?.token) fetchAllData();
    };
    window.addEventListener('investmentMade', handleInvestment);
    return () => {
      window.removeEventListener('investmentMade', handleInvestment);
    };
  }, [apiBaseUrl, auth?.token]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className={styles.loading}>Loading Dashboard...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className={styles.dashboard}>
        <header className={styles.header}>
          <h1>Project Dashboard</h1>
          <p>Real-time performance metrics</p>
        </header>

      <div className={styles.statsGrid}>
        <StatCard title="Total Raised" value={`₹${summary?.totalRaised?.toLocaleString() || '0'}`} icon={<FiDollarSign aria-hidden="true" />} />
        <StatCard title="Active Backers" value={summary?.activeBackers?.toLocaleString() || '0'} icon={<FiUsers aria-hidden="true" />} />
        <StatCard title="Funding Goal" value={`${Math.round((summary?.totalRaised / summary?.fundingGoal) * 100) || 0}%`} icon={<FiTarget aria-hidden="true" />} />
        <StatCard title="Page Views" value={summary?.pageViews?.toLocaleString() || '0'} icon={<FiEye aria-hidden="true" />} />
      </div>

      <div className={styles.mainGrid}>
        <div className={styles.chartContainer}>
          <h2>Funding Performance</h2>
          <PerformanceChart data={performance} />
        </div>
      </div>

      <div className={styles.projectsTable}>
        <h2>Your Projects</h2>
        <table>
          <thead>
            <tr>
              <th>Project Name</th>
              <th>Status</th>
              <th>Funding</th>
              <th>Days Left</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {projects.map(project => (
              <tr key={project._id}>
                <td>{project.title}</td>
                <td><span className={`${styles.status} ${styles[project.status]}`}>{project.status}</span></td>
                <td>₹{project.currentAmount?.toLocaleString() || '0'}</td>
                <td>{Math.max(0, Math.ceil((new Date(project.deadline) - new Date()) / (1000 * 60 * 60 * 24)))}</td>
                <td className={styles.actions}>
                  <button aria-label="View project" onClick={() => navigate(`/projects/${project._id}`)}><FiEye aria-hidden="true" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
