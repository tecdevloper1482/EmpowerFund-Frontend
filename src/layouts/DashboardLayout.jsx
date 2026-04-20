import React from 'react';
import Sidebar from '../components/layouts/Sidebar';
import styles from './DashboardLayout.module.css';

const DashboardLayout = ({ children }) => {
  return (
    <div className={styles.dashboardShell}>
      <Sidebar />
      <main className={styles.mainContent}>{children}</main>
    </div>
  );
};

export default DashboardLayout;
