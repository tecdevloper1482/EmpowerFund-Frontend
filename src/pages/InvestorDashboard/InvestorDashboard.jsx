import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiActivity, FiCheckCircle, FiClock, FiDollarSign, FiFolder, FiTrendingUp } from 'react-icons/fi';
import DashboardLayout from '../../layouts/DashboardLayout';
import styles from './InvestorDashboard.module.css';

const StatCard = ({ title, value, icon }) => (
  <article className={styles.statCard}>
    <span className={styles.statIcon}>{icon}</span>
    <div>
      <p className={styles.statTitle}>{title}</p>
      <h3 className={styles.statValue}>{value}</h3>
    </div>
  </article>
);

const TrendChart = ({ points }) => {
  if (!points.length) {
    return (
      <div className={styles.emptyChart}>
        <p className={styles.emptyBox}>No trend data available yet.</p>
        <p className={styles.emptyHint}>Make your first investment to see the monthly trend line here.</p>
      </div>
    );
  }

  const width = 680;
  const height = 260;
  const padX = 38;
  const padY = 28;
  const normalizedPoints = [...points]
    .map((item) => ({
      month: item.month,
      amount: Number(item.amount || 0),
    }))
    .sort((left, right) => String(left.month).localeCompare(String(right.month)));

  const values = normalizedPoints.map((item) => item.amount);
  const maxValue = Math.max(...values, 1);
  const xStep = normalizedPoints.length > 1 ? (width - padX * 2) / (normalizedPoints.length - 1) : 0;

  const pointCoordinates = normalizedPoints.map((item, index) => {
    const x = normalizedPoints.length === 1 ? width / 2 : padX + index * xStep;
    const y = height - padY - (item.amount / maxValue) * (height - padY * 2);
    return { ...item, x, y };
  });

  const linePoints = pointCoordinates.map((point) => `${point.x},${point.y}`).join(' ');
  const areaPoints = `
    ${pointCoordinates.map((point) => `${point.x},${point.y}`).join(' ')}
    ${pointCoordinates.length === 1 ? `${pointCoordinates[0].x},${height - padY} ${pointCoordinates[0].x},${height - padY}` : `${pointCoordinates[pointCoordinates.length - 1].x},${height - padY} ${pointCoordinates[0].x},${height - padY}`}
  `.trim();

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className={styles.chartSvg} role='img' aria-label='Investment trend chart'>
      <defs>
        <linearGradient id='trendFill' x1='0' x2='0' y1='0' y2='1'>
          <stop offset='0%' stopColor='#4a8dff' stopOpacity='0.34' />
          <stop offset='100%' stopColor='#4a8dff' stopOpacity='0.02' />
        </linearGradient>
      </defs>

      {[0, 1, 2, 3].map((index) => {
        const y = padY + ((height - padY * 2) / 3) * index;
        return <line key={index} x1={padX} x2={width - padX} y1={y} y2={y} className={styles.gridLine} />;
      })}

      <polygon className={styles.chartArea} points={areaPoints} />
      <polyline className={styles.chartLine} points={linePoints} />

      {pointCoordinates.map((point) => (
        <g key={`${point.month}-${point.x}`}>
          <circle cx={point.x} cy={point.y} r='4.5' className={styles.chartDot} />
          <text x={point.x} y={height - 8} textAnchor='middle' className={styles.chartLabel}>
            {point.month}
          </text>
        </g>
      ))}
    </svg>
  );
};

const InvestorDashboard = () => {
  const location = useLocation();
  const [summary, setSummary] = useState(null);
  const [investments, setInvestments] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [trend, setTrend] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const apiBaseUrl = useMemo(() => import.meta.env.VITE_API_URL || 'http://localhost:5000/api', []);
  const auth = useMemo(() => {
    const stored = localStorage.getItem('empowerfund_auth');
    if (!stored) return null;

    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }, []);

  const sectionTitle = useMemo(() => {
    if (location.pathname.endsWith('/investments')) return 'My Investments';
    if (location.pathname.endsWith('/transactions')) return 'Transactions';
    return 'Dashboard';
  }, [location.pathname]);

  useEffect(() => {
    const fetchData = async (endpoint) => {
      const response = await fetch(`${apiBaseUrl}/investor/dashboard/${endpoint}`, {
        headers: {
          Authorization: `Bearer ${auth?.token}`,
        },
      });

      const data = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(data?.message || `Failed to fetch ${endpoint}`);
      }

      return data;
    };

    const fetchAll = async () => {
      try {
        setLoading(true);
        setError('');

        const [summaryData, investmentsData, activityData, notificationsData, trendData] = await Promise.all([
          fetchData('summary'),
          fetchData('investments'),
          fetchData('recent-activity'),
          fetchData('notifications'),
          fetchData('trend'),
        ]);

        setSummary(summaryData);
        setInvestments(Array.isArray(investmentsData) ? investmentsData : []);
        setRecentActivity(Array.isArray(activityData) ? activityData : []);
        setNotifications(Array.isArray(notificationsData) ? notificationsData : []);
        setTrend(Array.isArray(trendData) ? trendData : []);
      } catch (fetchError) {
        setError(fetchError.message || 'Unable to load investor dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    if (auth?.token) {
      fetchAll();
    }
  }, [apiBaseUrl, auth?.token]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className={styles.loading}>Loading investor dashboard...</div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className={styles.error}>{error}</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className={styles.page}>
        <header className={styles.header}>
          <h1>Investor {sectionTitle}</h1>
          <p>Track investments, performance, and creator updates in one place.</p>
        </header>

        <section className={styles.summaryGrid}>
          <StatCard
            title='Total Amount Invested'
            value={`Rs ${Number(summary?.totalAmountInvested || 0).toLocaleString()}`}
            icon={<FiDollarSign aria-hidden='true' />}
          />
          <StatCard
            title='Total Projects Invested'
            value={Number(summary?.totalProjectsInvested || 0).toLocaleString()}
            icon={<FiFolder aria-hidden='true' />}
          />
          <StatCard
            title='Active Investments'
            value={Number(summary?.activeInvestments || 0).toLocaleString()}
            icon={<FiClock aria-hidden='true' />}
          />
          <StatCard
            title='Completed Investments'
            value={Number(summary?.completedInvestments || 0).toLocaleString()}
            icon={<FiCheckCircle aria-hidden='true' />}
          />
        </section>

        <section className={styles.middleGrid}>
          <article className={styles.panel}>
            <div className={styles.panelHead}>
              <h2>Investment Trends</h2>
              <span className={styles.panelIcon}><FiTrendingUp aria-hidden='true' /></span>
            </div>
            <TrendChart points={trend} />
          </article>

          <article className={styles.panel}>
            <div className={styles.panelHead}>
              <h2>Recent Activity</h2>
              <span className={styles.panelIcon}><FiActivity aria-hidden='true' /></span>
            </div>
            {recentActivity.length === 0 ? (
              <p className={styles.emptyBox}>No recent transactions yet.</p>
            ) : (
              <ul className={styles.activityList}>
                {recentActivity.map((item) => (
                  <li key={item._id}>
                    <p>{item.description}</p>
                    <span>{new Date(item.createdAt).toLocaleString()}</span>
                  </li>
                ))}
              </ul>
            )}
          </article>
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHead}>
            <h2>My Investments</h2>
          </div>
          {investments.length === 0 ? (
            <div className={styles.emptyWrap}>
              <p>You have not invested in any projects yet.</p>
              <Link to='/projects' className={styles.ctaLink}>Explore Projects</Link>
            </div>
          ) : (
            <div className={styles.tableWrap}>
              <table>
                <thead>
                  <tr>
                    <th>Project Title</th>
                    <th>Amount Invested</th>
                    <th>Date of Investment</th>
                    <th>Project Status</th>
                    <th>Funding Progress</th>
                  </tr>
                </thead>
                <tbody>
                  {investments.map((item) => (
                    <tr key={item._id}>
                      <td>{item.projectTitle}</td>
                      <td>Rs {Number(item.amountInvested || 0).toLocaleString()}</td>
                      <td>{new Date(item.dateOfInvestment).toLocaleDateString()}</td>
                      <td>
                        <span className={`${styles.badge} ${styles[item.projectStatus.toLowerCase()]}`}>
                          {item.projectStatus}
                        </span>
                      </td>
                      <td>
                        <div className={styles.rowProgress}>
                          <span style={{ width: `${item.fundingProgress}%` }} />
                        </div>
                        <small>{item.fundingProgress}%</small>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHead}>
            <h2>Notifications</h2>
          </div>
          {notifications.length === 0 ? (
            <p className={styles.emptyBox}>No notifications right now.</p>
          ) : (
            <ul className={styles.notificationList}>
              {notifications.map((item) => (
                <li key={item._id}>
                  <p>{item.message}</p>
                  <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
};

export default InvestorDashboard;
