import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiBarChart2, FiChevronLeft, FiChevronRight, FiCreditCard, FiFolder, FiUser, FiZap } from 'react-icons/fi';
import styles from './Sidebar.module.css';

const Sidebar = () => {
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(true);

  const auth = (() => {
    const storedAuth = localStorage.getItem('empowerfund_auth');
    if (!storedAuth) return null;
    try {
      return JSON.parse(storedAuth);
    } catch {
      return null;
    }
  })();

  const isInvestor = auth?.role === 'Investor';

  const creatorMenuItems = [
    { label: 'My Projects', icon: <FiFolder />, path: '/dashboard', id: 'projects' },
  ];

  const investorMenuItems = [
    { label: 'Dashboard', icon: <FiBarChart2 />, path: '/investor/dashboard', id: 'dashboard' },
    { label: 'My Investments', icon: <FiFolder />, path: '/investor/investments', id: 'investments' },
    { label: 'Transactions', icon: <FiCreditCard />, path: '/investor/transactions', id: 'transactions' },
    { label: 'Profile', icon: <FiUser />, path: '/profile', id: 'profile' },
  ];

  const menuItems = isInvestor ? investorMenuItems : creatorMenuItems;

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <aside className={`${styles.sidebar} ${isExpanded ? styles.expanded : styles.collapsed}`}>
      <div className={styles.header}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}><FiZap aria-hidden="true" /></span>
        </div>
        {isExpanded && <p className={styles.subtitle}>{isInvestor ? 'Investor Hub' : 'Creator Hub'}</p>}
      </div>

      <nav className={styles.nav}>
        <ul className={styles.menuList}>
          {menuItems.map((item) => (
            <li key={item.id}>
              <Link
                to={item.path}
                className={`${styles.menuItem} ${isActive(item.path) ? styles.active : ''}`}
              >
                <span className={styles.icon}>{item.icon}</span>
                {isExpanded && <span className={styles.label}>{item.label}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <button
        className={styles.toggleBtn}
        onClick={() => setIsExpanded(!isExpanded)}
        title={isExpanded ? 'Collapse' : 'Expand'}
      >
        {isExpanded ? <FiChevronLeft aria-hidden="true" /> : <FiChevronRight aria-hidden="true" />}
      </button>
    </aside>
  );
};

export default Sidebar;
