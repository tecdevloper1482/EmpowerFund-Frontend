import React, { useState } from 'react';
import styles from './Footer.module.css';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribeMessage, setSubscribeMessage] = useState('');

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (!email) {
      setSubscribeMessage('Please enter your email address.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setSubscribeMessage('Please enter a valid email address.');
      return;
    }
    setSubscribeMessage('✓ Thank you for subscribing!');
    setEmail('');
    setTimeout(() => setSubscribeMessage(''), 3000);
  };

  return (
    <footer className={styles.footerWrapper}>
      {/* Main Footer Content */}
      <div className={styles.footer}>
        <div className={styles.container}>
          {/* Left Section - Brand & Description */}
          <div className={styles.section}>
            <div className={styles.brandSection}>
              <h3 className={styles.logo}>Empower Fund</h3>
              <p className={styles.description}>
                Empower Fund helps creators, startups, and innovators raise funds for meaningful projects and impactful ideas.
              </p>
            </div>
          </div>

          {/* Middle Section - Quick Links */}
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Quick Links</h4>
            <ul className={styles.linksList}>
              <li><a href="/">Home</a></li>
              <li><a href="/discover">Discover Projects</a></li>
              <li><a href="/dashboard">Dashboard</a></li>
              <li><a href="/about">About Us</a></li>
            </ul>
          </div>

          {/* Middle Section - Support */}
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Support</h4>
            <ul className={styles.linksList}>
              <li><a href="#help">Help Center</a></li>
              <li><a href="#faq">FAQs</a></li>
              <li><a href="#privacy">Privacy Policy</a></li>
              <li><a href="#terms">Terms & Conditions</a></li>
              <li><a href="#refund">Refund Policy</a></li>
            </ul>
          </div>

          {/* Right Section - Newsletter */}
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Stay Updated</h4>
            <p className={styles.newsletterText}>Subscribe to get updates on new projects and opportunities.</p>
            <form className={styles.newsletterForm} onSubmit={handleNewsletterSubmit}>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={styles.emailInput}
                aria-label="Newsletter subscription email"
              />
              <button type="submit" className={styles.subscribeBtn} aria-label="Subscribe to newsletter">
                Subscribe
              </button>
            </form>
            {subscribeMessage && (
              <p className={`${styles.message} ${subscribeMessage.includes('✓') ? styles.success : styles.error}`}>
                {subscribeMessage}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className={styles.bottomBar}>
        <div className={styles.bottomContainer}>
          <p className={styles.copyright}>© 2024 Empower Fund. All rights reserved.</p>
          <div className={styles.bottomLinks}>
            <a href="#privacy">Privacy</a>
            <a href="#terms">Terms</a>
            <a href="#help">Help</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
