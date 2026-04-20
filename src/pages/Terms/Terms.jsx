import React from 'react'
import { Link } from 'react-router-dom'
import styles from './Terms.module.css'

const Terms = () => {
  const lastUpdated = 'April 15, 2026'

  return (
    <section className={styles.page}>
      <div className={styles.hero}>
        <p className={styles.kicker}>Legal</p>
        <h1>Terms and Conditions</h1>
        <p className={styles.subtitle}>
          These Terms and Conditions govern your use of EmpowerFund. Please read them carefully before creating an account,
          launching a campaign, or contributing funds.
        </p>
        <p className={styles.meta}>Last updated: {lastUpdated}</p>
      </div>

      <article className={styles.termsCard}>
        <section id='introduction' className={styles.section}>
          <h2>1. Introduction</h2>
          <p>
            EmpowerFund is a platform that connects Creators who raise funds for projects, startups, and social causes with
            Investors/Donors who choose to support those campaigns.
          </p>
          <p>
            By accessing or using the Platform, you agree to these Terms and Conditions. If you do not agree, you should not use
            the Platform.
          </p>
        </section>

        <section id='definitions' className={styles.section}>
          <h2>2. Definitions</h2>
          <ul>
            <li><strong>Platform</strong>: The EmpowerFund website, applications, and related services.</li>
            <li><strong>User</strong>: Any person who visits, registers, or uses the Platform.</li>
            <li><strong>Creator</strong>: A User who creates and manages fundraising Campaigns.</li>
            <li><strong>Investor/Donor</strong>: A User who contributes money to a Campaign.</li>
            <li><strong>Campaign</strong>: A fundraising listing published by a Creator on the Platform.</li>
            <li><strong>Funds</strong>: Monetary contributions made by Investors/Donors to Campaigns.</li>
          </ul>
        </section>

        <section id='eligibility' className={styles.section}>
          <h2>3. User Eligibility</h2>
          <ul>
            <li>You must be at least 18 years old to use the Platform.</li>
            <li>You must provide accurate, complete, and updated information at all times.</li>
            <li>You are responsible for all activity that happens through your account.</li>
          </ul>
        </section>

        <section id='registration' className={styles.section}>
          <h2>4. Account Registration</h2>
          <ul>
            <li>You must provide valid personal and contact details during registration.</li>
            <li>You are responsible for maintaining the confidentiality of your login credentials.</li>
            <li>You must notify us immediately if you suspect unauthorized access to your account.</li>
          </ul>
        </section>

        <section id='usage-rules' className={styles.section}>
          <h2>5. Platform Usage Rules</h2>
          <ul>
            <li>Do not post illegal, fraudulent, or misleading Campaigns.</li>
            <li>Do not misuse collected Funds for purposes not stated in the Campaign.</li>
            <li>Treat other Users respectfully; abuse, harassment, and harmful conduct are not allowed.</li>
          </ul>
        </section>

        <section id='creator-responsibilities' className={styles.section}>
          <h2>6. Creator Responsibilities</h2>
          <ul>
            <li>Provide clear and accurate Campaign information, including objectives and expected outcomes.</li>
            <li>Use received Funds only for the purposes described in the Campaign.</li>
            <li>Provide timely updates to Investors/Donors regarding progress, challenges, and use of Funds.</li>
          </ul>
        </section>

        <section id='investor-responsibilities' className={styles.section}>
          <h2>7. Investor/Donor Responsibilities</h2>
          <ul>
            <li>Review Campaign information carefully and understand potential risks before contributing.</li>
            <li>Contributions are made at your own discretion; project outcomes are not guaranteed.</li>
            <li>The Platform is not responsible for Creator performance, business outcomes, or Campaign success/failure.</li>
          </ul>
        </section>

        <section id='payments-and-fees' className={styles.section}>
          <h2>8. Payments and Fees</h2>
          <ul>
            <li>Payments are processed through third-party gateways such as Razorpay or Stripe.</li>
            <li>The Platform may charge service fees or commissions, which will be shown before payment confirmation.</li>
            <li>
              Refund requests, where applicable, are reviewed based on campaign terms, payment provider policies, and applicable
              law.
            </li>
          </ul>
        </section>

        <section id='intellectual-property' className={styles.section}>
          <h2>9. Intellectual Property</h2>
          <ul>
            <li>Users retain ownership of content they submit, but grant the Platform rights needed to display and operate it.</li>
            <li>All Platform branding, design, and software are protected by applicable intellectual property laws.</li>
            <li>Copying, reproducing, or redistributing Platform content without written permission is prohibited.</li>
          </ul>
        </section>

        <section id='privacy-policy-reference' className={styles.section}>
          <h2>10. Privacy Policy Reference</h2>
          <p>
            We are committed to protecting your personal data. Please review our Privacy Policy to understand how data is
            collected, used, and protected.
          </p>
          <p>
            Privacy Policy link: <Link to='/privacy-policy'>View Privacy Policy</Link>
          </p>
        </section>

        <section id='termination' className={styles.section}>
          <h2>11. Termination of Account</h2>
          <p>
            We may suspend or terminate accounts that violate these Terms, applicable laws, or Platform safety requirements.
          </p>
        </section>

        <section id='limitation-of-liability' className={styles.section}>
          <h2>12. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, EmpowerFund is not liable for losses, fraud, failed campaigns, indirect
            damages, or disputes between Users.
          </p>
        </section>

        <section id='dispute-resolution' className={styles.section}>
          <h2>13. Dispute Resolution</h2>
          <ul>
            <li>These Terms are governed by the laws of India.</li>
            <li>
              Any dispute should first be addressed through good-faith discussions with our support team before formal legal
              action.
            </li>
            <li>Courts with competent jurisdiction in India will have authority over unresolved disputes.</li>
          </ul>
        </section>

        <section id='changes' className={styles.section}>
          <h2>14. Changes to Terms</h2>
          <p>
            We may update these Terms at any time. Updated versions become effective when posted on this page, and your continued
            use of the Platform means you accept the revised Terms.
          </p>
        </section>

        <section id='contact' className={styles.section}>
          <h2>15. Contact Information</h2>
          <p>
            For questions about these Terms, contact us at <a href='mailto:support@empowerfund.com'>support@empowerfund.com</a>.
          </p>
        </section>
      </article>
    </section>
  )
}

export default Terms
