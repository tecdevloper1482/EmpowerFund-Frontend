import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import styles from './Home.module.css';
import heroImage from '../../assets/hero.png';

const categories = ['All', 'Tech', 'Social', 'Creative', 'Education', 'Health', 'Environment'];

const ProjectCard = ({ project }) => {
	const fundingPercentage = project.goalAmount > 0 ? Math.round((project.currentAmount / project.goalAmount) * 100) : 0;
	const projectImageSrc = project.imageURLs?.[0] || project.imageURL || heroImage;

	const daysLeft = () => {
		const deadline = new Date(project.deadline);
		const now = new Date();
		const diff = deadline.getTime() - now.getTime();
		if (diff <= 0) return 'Ended';
		const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
		return `${days} days left`;
	};

	return (
		<article className={styles.card}>
			<div className={styles.cardImageWrap}>
				<img src={projectImageSrc} alt={project.title} className={styles.cardImage} />
				<span className={styles.daysLeft}>{daysLeft()}</span>
			</div>
			<div className={styles.cardBody}>
				<h3>{project.title}</h3>
				<p className={styles.creator}>by {project.creator?.fullname || 'Unknown creator'}</p>
				<p className={styles.desc}>{project.description}</p>
				<div className={styles.fundingProgress}>
					<div className={styles.fundingRow}>
						<span>{fundingPercentage}% Funded</span>
						<span>
							₹{project.currentAmount?.toLocaleString() || '0'} / ₹{project.goalAmount?.toLocaleString() || '0'}
						</span>
					</div>
					<div className={styles.progressTrack}>
						<span style={{ width: `${fundingPercentage}%` }}></span>
					</div>
				</div>
				<Link to={`/projects/${project._id}`} className={styles.investBtn}>
					Invest Now
				</Link>
			</div>
		</article>
	);
};

const Home = () => {
	const [projects, setProjects] = useState([]);
	const [activeCategory, setActiveCategory] = useState('All');
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [authUser, setAuthUser] = useState(null);

	const apiBaseUrl = useMemo(() => import.meta.env.VITE_API_URL || 'http://localhost:5000/api', []);

	useEffect(() => {
		const loadAuthUser = () => {
			try {
				const raw = localStorage.getItem('empowerfund_auth');
				if (!raw) {
					setAuthUser(null);
					return;
				}

				const parsed = JSON.parse(raw);
				setAuthUser(parsed?.token ? parsed : null);
			} catch {
				setAuthUser(null);
			}
		};

		loadAuthUser();
		window.addEventListener('storage', loadAuthUser);
		window.addEventListener('empowerfund-auth-changed', loadAuthUser);

		return () => {
			window.removeEventListener('storage', loadAuthUser);
			window.removeEventListener('empowerfund-auth-changed', loadAuthUser);
		};
	}, []);

	useEffect(() => {
		const fetchProjects = async () => {
			setLoading(true);
			try {
				const query = activeCategory === 'All' ? '' : `?category=${activeCategory}`;
				const res = await fetch(`${apiBaseUrl}/projects${query}`);
				if (!res.ok) {
					throw new Error('Failed to fetch projects');
				}
				const data = await res.json();
				setProjects(Array.isArray(data) ? data : []);
			} catch (err) {
				setError(err.message);
			} finally {
				setLoading(false);
			}
		};

		fetchProjects();
	}, [apiBaseUrl, activeCategory]);

	const canLaunchProject = authUser?.role !== 'Investor';

	const trendingProjects = useMemo(() => {
		return projects.filter((project) => {
			const fundingPercentage = project.goalAmount > 0 ? (project.currentAmount / project.goalAmount) * 100 : 0;
			return fundingPercentage > 50;
		});
	}, [projects]);


	return (
		<div className={styles.page}>
			<section className={styles.hero}>
				<img src={heroImage} alt='Innovation globe' className={styles.heroImage} />
				<div className={styles.heroContent}>
					<span className={styles.badge}>Featured Innovation</span>
					<h1>Fuel the Future of Innovation</h1>
					<p>
						Support high-impact projects through transparent, decentralized
						crowdfunding. Join the revolution of venture funding.
					</p>
					<div className={styles.heroActions}>
						<Link to='/projects' className={styles.primaryBtn}>
							Explore Projects
						</Link>
						{canLaunchProject ? (
							<Link to='/projects/create' className={styles.secondaryBtn}>
								Launch Project
							</Link>
						) : null}
					</div>
				</div>
			</section>

			<section className={styles.projectsSection}>
				<div className={styles.sectionTop}>
					<div>
						<h2>Trending Projects</h2>
						<p>Projects with 50%+ funding progress</p>
					</div>

					<div className={styles.categories}>
						{categories.map((category) => (
							<button
								key={category}
								type='button'
								className={`${styles.categoryBtn} ${activeCategory === category ? styles.activeCategory : ''}`}
								onClick={() => setActiveCategory(category)}
							>
								{category}
							</button>
						))}
					</div>
				</div>

				{loading && <p className={styles.info}>Loading projects...</p>}
				{error && <p className={styles.error}>Error: {error}</p>}

				<div className={styles.cardsGrid}>
					{!loading && trendingProjects.length > 0 ? (
						trendingProjects.map((project) => (
							<ProjectCard key={project._id} project={project} />
						))
					) : (
						!loading && <p className={styles.emptyState}>No trending projects found in this category.</p>
					)}
				</div>

				<div className={styles.bottomAction}>
					<Link to='/projects' className={styles.viewAllBtn}>
						View All Projects
					</Link>
					<p>{trendingProjects.length} trending projects</p>
				</div>
			</section>
		</div>
	);
}

export default Home;
