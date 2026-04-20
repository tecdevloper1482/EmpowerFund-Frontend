import React from 'react';
import styles from './Footer.module.css';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div>© 2024 Empower Fund. All rights reserved.</div>
      <div className={styles.links}>
        <a href="#privacy">PRIVACY</a>
        <a href="#terms">TERMS</a>
        <a href="#help">HELP</a>
      </div>
    </footer>
  );
};

export default Footer;
