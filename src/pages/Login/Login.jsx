import React, { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { FaRocket } from 'react-icons/fa'
import { FiDollarSign, FiEye, FiEyeOff, FiLock, FiMail } from 'react-icons/fi'
import styles from './Login.module.css'

const Login = () => {
	const navigate = useNavigate()
	const [searchParams] = useSearchParams()
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [role, setRole] = useState('Creator')
	const [showPassword, setShowPassword] = useState(false)
	const [errorMessage, setErrorMessage] = useState('')
	const [successMessage, setSuccessMessage] = useState('')
	const [isSubmitting, setIsSubmitting] = useState(false)

	const handleSubmit = async (event) => {
		event.preventDefault()
		setErrorMessage('')
		setSuccessMessage('')

		if (!email.trim() || !password.trim()) {
			setErrorMessage('Email and password are required.')
			return
		}

		setIsSubmitting(true)
		const apiBaseUrl = import.meta.env.VITE_API_URL'

		try {
			const response = await fetch(`${apiBaseUrl}/auth/login`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					email: email.trim(),
					password,
					role,
				}),
			})

			const data = await response.json().catch(() => null)
			if (!response.ok) {
				setErrorMessage(data?.message || 'Invalid credentials. Please try again.')
				return
			}

			if (data?.token) {
				localStorage.setItem('empowerfund_auth', JSON.stringify(data))
				window.dispatchEvent(new Event('empowerfund-auth-changed'))
			}

			setSuccessMessage('Login successful. Redirecting...')
			setTimeout(() => navigate('/'), 700)
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
					<h1>Welcome Back</h1>
					<p>Sign in to continue building and backing bold ideas.</p>
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
					<label className={styles.label} htmlFor='email'>
						Email Address
					</label>
					<div className={styles.inputWrap}>
						<span className={styles.inputIcon}><FiMail aria-hidden='true' /></span>
						<input
							id='email'
							type='email'
							placeholder='name@company.com'
							value={email}
							onChange={(event) => setEmail(event.target.value)}
						/>
					</div>

					<label className={styles.label} htmlFor='password'>
						Password
					</label>
					<div className={styles.inputWrap}>
						<span className={styles.inputIcon}><FiLock aria-hidden='true' /></span>
						<input
							id='password'
							type={showPassword ? 'text' : 'password'}
							placeholder='••••••••'
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

					{errorMessage ? <p className={styles.errorText}>{errorMessage}</p> : null}
					{successMessage ? <p className={styles.successText}>{successMessage}</p> : null}

					<div className={styles.formLinks}>
						<Link to='/register'>Create an account</Link>
					</div>

					<button type='submit' className={styles.submitBtn} disabled={isSubmitting}>
						{isSubmitting ? 'Signing In...' : 'Sign In'}
					</button>
				</form>

				<p className={styles.switchAuth}>
					New to Empower Fund? <Link to='/register'>Register now</Link>
				</p>
			</div>
		</section>
	)
}

export default Login
