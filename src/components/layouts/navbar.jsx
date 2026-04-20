import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from './Navbar.module.css';
import logo from '../../assets/logo.png';

const Navbar = () => {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';
  const isRegisterPage = location.pathname === '/register';

  const [authUser, setAuthUser] = useState(null);

  useEffect(() => {
    const loadAuthUser = () => {
      try {
        const raw = localStorage.getItem('empowerfund_auth');
        if (!raw) {
          setAuthUser(null);
          return;
        }

        const parsed = JSON.parse(raw);
        if (parsed?.token) {
          setAuthUser(parsed);
          return;
        }

        setAuthUser(null);
      } catch {
        setAuthUser(null);
      }
    };

    loadAuthUser();

    const onStorage = () => loadAuthUser();
    window.addEventListener('storage', onStorage);
    window.addEventListener('empowerfund-auth-changed', onStorage);

    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('empowerfund-auth-changed', onStorage);
    };
  }, []);

  const avatarInitial = useMemo(() => {
    const name = authUser?.fullname?.trim();
    if (!name) {
      return 'U';
    }
    return name.charAt(0).toUpperCase();
  }, [authUser]);

  const dashboardPath = authUser?.role === 'Investor' ? '/investor/dashboard' : '/dashboard';
  const isHomeActive = location.pathname === '/';
  const isCreateProjectActive = location.pathname === '/projects/create';
  const isDashboardActive = location.pathname === dashboardPath;

  return (
    <nav className={styles.navbar}>
      <div className={styles.logoContainer}>
        <Link to="/" className={styles.logoLink}>
          <img src={logo} alt="EmpowerFund logo" className={styles.logoImage} />
        </Link>
      </div>
      <div className={styles.navLinks}>
        <Link
          to="/"
          className={`${styles.navPill} ${isHomeActive ? styles.navPillActive : ''}`}
        >
          Home
        </Link>

        {authUser ? (
          <>
            {authUser.role === 'Creator' ? (
              <Link to="/projects/create" className={`${styles.navPill} ${isCreateProjectActive ? styles.navPillActive : ''}`}>
                Create Project
              </Link>
            ) : null}
            <Link to={dashboardPath} className={`${styles.navPill} ${isDashboardActive ? styles.navPillActive : ''}`}>
              Dashboard
            </Link>
            <Link to="/profile" className={styles.profileBtn} title={authUser.fullname || 'User profile'}>
              <span className={styles.profileAvatar}>{avatarInitial}</span>
            </Link>
          </>
        ) : (
          <>
            <span className={styles.linkText}>
              {isLoginPage ? "Don't have an account?" : isRegisterPage ? 'Already have an account?' : 'Already have an account?'}
            </span>
            <Link to={isLoginPage ? '/register' : '/login'} className={styles.loginBtn}>
              {isLoginPage ? 'Register' : 'Login'}
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
