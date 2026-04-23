import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FaRocket } from 'react-icons/fa'
import { FiDollarSign, FiEye, FiEyeOff, FiLock, FiMail, FiUser } from 'react-icons/fi'
import styles from './Register.module.css'

const Register = () => {
  const navigate = useNavigate()
  const [fullname, setFullname] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [role, setRole] = useState('Creator')
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    if (!fullname.trim() || !email.trim() || !password || !confirm) {
      setErrorMessage('All fields are required.')
      return
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.')
      return
    }

    if (password !== confirm) {
      setErrorMessage('Password and confirm password do not match.')
      return
    }

    if (!agreeTerms) {
      setErrorMessage('You must agree to the terms to continue.')
      return
    }

    setIsSubmitting(true)
    const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

    try {
      const response = await fetch(`${apiBaseUrl}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullname: fullname.trim(),
          email: email.trim(),
          password,
          role,
        }),
      })

      const data = await response.json().catch(() => null)
      if (!response.ok) {
        setErrorMessage(data?.message || 'Registration failed. Please try again.')
        return
      }

      if (data?.token) {
        localStorage.setItem('empowerfund_auth', JSON.stringify(data))
        window.dispatchEvent(new Event('empowerfund-auth-changed'))
      }

      setSuccessMessage('Account created successfully. Redirecting...')
      setTimeout(() => navigate('/login'), 700)
    } catch {
      setErrorMessage('Unable to connect to server. Please check your API URL and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className={styles.loginWrap}>
          <div className={styles.card}>
            <header className={styles.header}>
              <h1>Start Building the Future</h1>
              <p>Join a global community of innovators and backers.</p>
            </header>
    
            <div className={styles.roleSwitch}>
              <button
                type='button'
                className={`${styles.roleBtn} ${role === 'Creator' ? styles.active : ''}`}
                onClick={() => setRole('Creator')}
              >
                <span className={styles.icon}><FaRocket aria-hidden='true' /></span>
                Creator
              </button>
              <button
                type='button'
                className={`${styles.roleBtn} ${role === 'Investor' ? styles.active : ''}`}
                onClick={() => setRole('Investor')}
              >
                <span className={styles.icon}><FiDollarSign aria-hidden='true' /></span>
                Investor
              </button>
            </div>
    
            <form className={styles.form} onSubmit={handleSubmit}>
              <label className={styles.label} htmlFor='fullname'>
                Full Name
              </label>
              <div className={styles.inputWrap}>
                <span className={styles.inputIcon}><FiUser aria-hidden='true' /></span>
                <input
                  id='fullname'
                  type='text'
                  placeholder='Enter your name'
                  value={fullname}
                  onChange={(event) => setFullname(event.target.value)}
                />
              </div>

              <label className={styles.label} htmlFor='email'>
                Email Address
              </label>
              <div className={styles.inputWrap}>
                <span className={styles.inputIcon}><FiMail aria-hidden='true' /></span>
                <input
                  id='email'
                  type='email'
                  placeholder='Enter your email'
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </div>
    
              <label className={styles.label} htmlFor='password'>
                Create Password
              </label>
              <div className={styles.inputWrap}>
                <span className={styles.inputIcon}><FiLock aria-hidden='true' /></span>
                <input
                  id='password'
                  type={showPassword ? 'text' : 'password'}
                  placeholder='Enter your password'
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
                <button
                  type='button'
                  className={styles.eyeBtn}
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label='Toggle password visibility'
                >
                  {showPassword ? <FiEyeOff aria-hidden='true' /> : <FiEye aria-hidden='true' />}
                </button>
              </div>

              <label className={styles.label} htmlFor='confirm'>
                Confirm Password
              </label>
              <div className={styles.inputWrap}>
                <span className={styles.inputIcon}><FiLock aria-hidden='true' /></span>
                <input
                  id='confirm'
                  type={showConfirm ? 'text' : 'password'}
                  placeholder='••••••••'
                  value={confirm}
                  onChange={(event) => setConfirm(event.target.value)}
                />
                <button
                  type='button'
                  className={styles.eyeBtn}
                  onClick={() => setShowConfirm((value) => !value)}
                  aria-label='Toggle confirm password visibility'
                >
                  {showConfirm ? <FiEyeOff aria-hidden='true' /> : <FiEye aria-hidden='true' />}
                </button>
              </div>

              {errorMessage ? <p className={styles.errorText}>{errorMessage}</p> : null}
              {successMessage ? <p className={styles.successText}>{successMessage}</p> : null}
    
              <label className={styles.terms}>
                <input
                  type='checkbox'
                  checked={agreeTerms}
                  onChange={(event) => setAgreeTerms(event.target.checked)}
                />
                <span>
                  I agree to the <Link to='/terms'>Terms and Conditions</Link> and{' '}
                  <Link to='/terms#privacy-policy-reference'>Privacy Policy</Link>.
                </span>
              </label>
    
              <button type='submit' className={styles.submitBtn} disabled={isSubmitting}>
                {isSubmitting ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            <p className={styles.switchAuth}>
              Already have an account? <Link to='/login'>Sign in</Link>
            </p>
          </div>
        </section>

      
   

  )
}

export default Register
