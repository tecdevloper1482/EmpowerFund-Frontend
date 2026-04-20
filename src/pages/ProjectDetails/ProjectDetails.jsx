import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styles from './PojectDetails.module.css';
import fallbackImage from '../../assets/hero.png';
import qrImage from '../../assets/image.png';



const ProjectDetails = () => {
		const [currentImage, setCurrentImage] = useState(0);
	const navigate = useNavigate();
	const { id } = useParams();
	const [project, setProject] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState('');
	const [showDialog, setShowDialog] = useState(false);
	const [fundAmount, setFundAmount] = useState('');
	const [isInvesting, setIsInvesting] = useState(false);

	const apiBaseUrl = useMemo(() => import.meta.env.VITE_API_URL || 'https://empowerfund-backend.onrender.com/api', []);

	// Fetch project details
	const fetchProject = async () => {
		setIsLoading(true);
		setError('');
		try {
			const response = await fetch(`${apiBaseUrl}/projects/${id}`);
			const data = await response.json().catch(() => null);
			if (!response.ok) {
				setError(data?.message || 'Failed to load project details');
				setProject(null);
				return;
			}
			setProject(data);
		} catch {
			setError('Unable to connect to backend API.');
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchProject();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [apiBaseUrl, id]);

	useEffect(() => {
		setCurrentImage(0);
	}, [id]);

	if (isLoading) {
		return <p className={styles.stateText}>Loading project...</p>;
	}

	if (error) {
		return <p className={styles.errorText}>{error}</p>;
	}

	if (!project) {
		return <p className={styles.stateText}>Project not found.</p>;
	}


	const raised = Number(project?.currentAmount || 0);
	const goal = Number(project?.goalAmount || 0);
	const progress = Math.min(100, Math.round((raised / (goal || 1)) * 100));

	const deadlineDate = project ? new Date(project.deadline) : new Date();
	const today = new Date();
	const msRemaining = deadlineDate.getTime() - today.getTime();
	const daysRemaining = Math.max(0, Math.ceil(msRemaining / (1000 * 60 * 60 * 24)));

	const backers = Math.max(3, Math.round(raised / 1200));
	const projectImages = Array.isArray(project.imageURLs) ? project.imageURLs : [];
	const primaryImageSrc = projectImages[0] || project.imageURL || fallbackImage;

	const getAuth = () => {
		const storedAuth = localStorage.getItem('empowerfund_auth');
		if (!storedAuth) return null;
		try {
			return JSON.parse(storedAuth);
		} catch {
			return null;
		}
	};

	const handleFundClick = () => {
		const auth = getAuth();
		if (!auth?.token) {
			navigate('/login');
			return;
		}
		setShowDialog(true);
		setFundAmount('');
	};

	const handleDialogClose = () => {
		setShowDialog(false);
		setFundAmount('');
	};


	const handleFundSubmit = async (e) => {
		e.preventDefault();
		const amt = Math.max(0, parseInt(fundAmount, 10) || 0);
		if (!amt) return;
		const auth = getAuth();
		if (!auth?.token) {
			navigate('/login');
			return;
		}
		setIsInvesting(true);
		try {
			const response = await fetch(`${apiBaseUrl}/projects/${id}/invest`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${auth.token}`,
				},
				body: JSON.stringify({ amount: amt }),
				credentials: 'include',
			});
			if (!response.ok) {
				const data = await response.json().catch(() => null);
				alert(data?.message || 'Investment failed');
			} else {
				await fetchProject(); // Refetch updated project
				// Dispatch custom event for dashboard update
				window.dispatchEvent(new Event('investmentMade'));
				setShowDialog(false);
				setFundAmount('');
			}
		} catch {
			alert('Unable to connect to backend API.');
		} finally {
			setIsInvesting(false);
		}
	};

	return (
		<section className={styles.page}>
			<div className={styles.layout}>
				<article className={styles.mainContent}>
						{projectImages.length > 0 ? (
						<div className={styles.carouselWrap}>
							<img
									src={projectImages[currentImage] || primaryImageSrc}
								alt={`Project image ${currentImage + 1}`}
								className={styles.heroImage}
								onError={(event) => {
									event.currentTarget.src = fallbackImage;
								}}
							/>
								{projectImages.length > 1 && (
								<>
									<button
										className={styles.carouselArrow + ' ' + styles.left}
											onClick={() => setCurrentImage((currentImage - 1 + projectImages.length) % projectImages.length)}
										aria-label="Previous image"
									>&#8592;</button>
									<button
										className={styles.carouselArrow + ' ' + styles.right}
											onClick={() => setCurrentImage((currentImage + 1) % projectImages.length)}
										aria-label="Next image"
									>&#8594;</button>
									<div className={styles.carouselIndicators}>
											{projectImages.map((_, idx) => (
											<span
												key={idx}
												className={currentImage === idx ? styles.activeDot : styles.dot}
												onClick={() => setCurrentImage(idx)}
											/>
										))}
									</div>
								</>
							)}
						</div>
					) : (
						<img
								src={primaryImageSrc}
							alt={project.title}
							className={styles.heroImage}
							onError={(event) => {
								event.currentTarget.src = fallbackImage;
							}}
						/>
					)}

					<div className={styles.body}>
						<span className={styles.category}>{project.category}</span>
						<h1>{project.title}</h1>

						<p className={styles.creator}>Started by {project.creator?.fullname || 'Unknown creator'}</p>

						<p className={styles.description}>{project.description}</p>
					</div>
				</article>

				<aside className={styles.sidebar}>
					<div className={styles.sidebarCard}>
						<h2>Funding Progress</h2>

						<div className={styles.statRow}>
							<span>Amount Raised</span>
							<strong>₹{raised.toLocaleString()}</strong>
						</div>

						<div className={styles.statRow}>
							<span>Funding Goal</span>
							<strong>₹{goal.toLocaleString()}</strong>
						</div>

						<div className={styles.statRow}>
							<span>Days Remaining</span>
							<strong>{daysRemaining}</strong>
						</div>

						<div className={styles.statRow}>
							<span>Backers</span>
							<strong>{backers}</strong>
						</div>

						<div className={styles.progressTrack}>
							<span style={{ width: `${progress}%` }} />
						</div>
						<p className={styles.progressText}>{progress}% of goal reached</p>

						<button type='button' className={styles.fundBtn} onClick={handleFundClick}>
							Fund This Project
						</button>
					</div>

					{/* Funding Dialog */}
					{showDialog && (
						<div className={styles.paymentOverlay} onClick={handleDialogClose}>
							<form className={styles.paymentCard} onSubmit={handleFundSubmit} onClick={(event) => event.stopPropagation()}>
								<h3>Pay Using QR</h3>
								<p className={styles.paymentHint}>
									Scan this QR code to pay, then enter the amount you paid below.
								</p>

								<img src={qrImage} alt="Payment QR Code" className={styles.qrImage} />

								<label htmlFor="paymentAmount" className={styles.paymentLabel}>Amount Paid (₹)</label>
								<input
									id="paymentAmount"
									type="number"
									min="1"
									value={fundAmount}
									onChange={(event) => setFundAmount(event.target.value)}
									placeholder="Enter amount"
									className={styles.paymentInput}
									required
								/>

								<div className={styles.paymentActions}>
									<button type="button" className={styles.cancelBtn} onClick={handleDialogClose}>
										Cancel
									</button>
									<button type="submit" className={styles.confirmBtn} disabled={isInvesting}>
										{isInvesting ? 'Processing...' : 'Confirm Payment'}
									</button>
								</div>
							</form>
						</div>
					)}
				</aside>
			</div>
		</section>
	);
};

export default ProjectDetails;
