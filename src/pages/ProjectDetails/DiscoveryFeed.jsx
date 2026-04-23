import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './DiscoveryFeed.module.css';
import fallbackImage from '../../assets/hero.png';

const categoryOptions = ['All', 'Tech', 'Social', 'Creative', 'Education', 'Health', 'Environment'];

const getProjectImageSrc = (project) => project.imageURLs?.[0] || project.imageURL || fallbackImage;

const DiscoveryFeed = () => {
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const apiBaseUrl = useMemo(() => import.meta.env.VITE_API_URL || 'http://localhost:5000/api', []);

  useEffect(() => {
    const controller = new AbortController();

    const fetchProjects = async () => {
      setIsLoading(true);
      setError('');

      try {
        const params = new URLSearchParams();
        if (search.trim()) params.set('search', search.trim());
        if (activeCategory !== 'All') params.set('category', activeCategory);

        const response = await fetch(`${apiBaseUrl}/projects?${params.toString()}`, {
          signal: controller.signal,
        });

        const data = await response.json().catch(() => []);

        if (!response.ok) {
          setError(data?.message || 'Failed to load projects');
          setProjects([]);
          return;
        }

        setProjects(Array.isArray(data) ? data : []);
      } catch (fetchError) {
        if (fetchError.name !== 'AbortError') {
          setError('Unable to connect to backend API.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
    return () => controller.abort();
  }, [apiBaseUrl, search, activeCategory]);

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <h1>Discover Projects</h1>
        <p>Explore bold ideas and fund the next breakthrough.</p>
      </header>

      <div className={styles.toolbar}>
        <input
          type='search'
          placeholder='Search projects by title...'
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <div className={styles.categories}>
          {categoryOptions.map((category) => (
            <button
              key={category}
              type='button'
              className={`${styles.filterBtn} ${activeCategory === category ? styles.active : ''}`}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {error ? <p className={styles.error}>{error}</p> : null}
      {isLoading ? <p className={styles.info}>Loading projects...</p> : null}
      {!isLoading && !error && projects.length === 0 ? (
        <p className={styles.info}>No projects found. Try a different filter.</p>
      ) : null}

      <div className={styles.grid}>
        {projects.map((project) => {
          const goalAmount = Number(project.goalAmount || 0);
          const currentAmount = Number(project.currentAmount || 0);
          const progress = goalAmount > 0 ? Math.min(100, Math.round((currentAmount / goalAmount) * 100)) : 0;

          return (
          <article key={project._id} className={styles.card}>
            <img
              src={getProjectImageSrc(project)}
              alt={project.title}
              className={styles.cardImage}
              onError={(event) => {
                event.currentTarget.src = fallbackImage;
              }}
            />

            <div className={styles.cardBody}>
              <div className={styles.metaRow}>
                <span className={styles.tag}>{project.category}</span>
                <span>{progress}% funded</span>
              </div>

              <h3>{project.title}</h3>
              <p className={styles.creator}>by {project.creator?.fullname || 'Unknown creator'}</p>

              <div className={styles.progressTrack}>
                <span style={{ width: `${progress}%` }} />
              </div>

              <p className={styles.amount}>
                ₹{currentAmount.toLocaleString()} / ₹{goalAmount.toLocaleString()}
              </p>

              <Link to={`/projects/${project._id}`} className={styles.viewBtn}>
                View Project
              </Link>
            </div>
          </article>
          );
        })}
      </div>
    </section>
  );
};

export default DiscoveryFeed;
