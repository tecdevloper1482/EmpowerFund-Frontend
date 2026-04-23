import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './CreateProject.module.css';

const categories = ['Tech', 'Social', 'Creative', 'Education', 'Health', 'Environment'];

const initialForm = {
  title: '',
  category: 'Tech',
  goalAmount: '',
  deadline: '',
  // imageURL: '',
  description: '',
};

const CreateProject = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState(initialForm);
  const [projectImageFiles, setProjectImageFiles] = useState([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState([]);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const progress = useMemo(() => (step / 3) * 100, [step]);
  const apiBaseUrl = useMemo(() => import.meta.env.VITE_API_URL || 'http://localhost:5000/api', []);

  const getAuth = () => {
    const storedAuth = localStorage.getItem('empowerfund_auth');
    return storedAuth ? JSON.parse(storedAuth) : null;
  };

  useEffect(() => {
    return () => {
      imagePreviewUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [imagePreviewUrls]);

  const onChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageFileChange = (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) {
      setProjectImageFiles([]);
      imagePreviewUrls.forEach(url => URL.revokeObjectURL(url));
      setImagePreviewUrls([]);
      return;
    }

    // Validate all files are images
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        setError('Please select only image files.');
        event.target.value = '';
        return;
      }
    }

    setError('');
    setProjectImageFiles(files);
    imagePreviewUrls.forEach(url => URL.revokeObjectURL(url));
    setImagePreviewUrls(files.map(file => URL.createObjectURL(file)));
  };

  const createProjectPayload = () => {
    // If no files, send imageURLs as JSON array (could be empty or from URL input)
    if (!projectImageFiles.length) {
      return {
        body: JSON.stringify({
          title: formData.title.trim(),
          description: formData.description.trim(),
          category: formData.category,
          goalAmount: Number(formData.goalAmount),
          deadline: formData.deadline,
          imageURLs: [],
        }),
        isMultipart: false,
      };
    }

    const payload = new FormData();
    payload.append('title', formData.title.trim());
    payload.append('description', formData.description.trim());
    payload.append('category', formData.category);
    payload.append('goalAmount', Number(formData.goalAmount));
    payload.append('deadline', formData.deadline);
    // No imageURLs field needed
    projectImageFiles.forEach(file => {
      payload.append('projectImages', file);
    });
    return {
      body: payload,
      isMultipart: true,
    };
  };

  const validateStep = (stepNumber) => {
    if (stepNumber === 1) {
      if (!formData.title.trim()) return 'Project title is required.';
      if (!formData.category) return 'Please select a category.';
    }

    if (stepNumber === 2) {
      const goal = Number(formData.goalAmount);
      if (!formData.goalAmount || Number.isNaN(goal) || goal <= 0) {
        return 'Goal amount must be a positive number.';
      }

      if (!formData.deadline) {
        return 'Please choose a deadline.';
      }

      const selectedDate = new Date(formData.deadline);
      const now = new Date();
      if (selectedDate <= now) {
        return 'Deadline must be in the future.';
      }
    }

    if (stepNumber === 3) {
      if (!formData.description.trim() || formData.description.trim().length < 30) {
        return 'Description must be at least 30 characters.';
      }
    }

    return '';
  };

  const handleNext = () => {
    const validationError = validateStep(step);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');
    setStep((prev) => Math.min(3, prev + 1));
  };

  const handleBack = () => {
    setError('');
    setStep((prev) => Math.max(1, prev - 1));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationError = validateStep(3);
    if (validationError) {
      setError(validationError);
      return;
    }

    const auth = getAuth();
    const isCreator = auth?.role === 'Creator';

    if (!isCreator) {
      setError('You do not have permission to create projects.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const payload = createProjectPayload();
      const response = await fetch(`${apiBaseUrl}/projects`, {
        method: 'POST',
        headers: {
          ...(payload.isMultipart ? {} : { 'Content-Type': 'application/json' }),
          Authorization: `Bearer ${auth.token}`,
        },
        body: payload.body,
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        setError(data?.message || 'Unable to create project.');
        return;
      }

      navigate(`/projects/${data._id}`);
    } catch {
      setError('Server connection failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className={styles.pageWrap}>
      <div className={styles.card}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>Launch Campaign</p>
          <h1>Create Your Project</h1>
          <p className={styles.subText}>Share your vision and start raising support on Empower Fund.</p>
        </header>

        <div className={styles.stepper}>
          <div className={styles.progressTrack}>
            <span style={{ width: `${progress}%` }} />
          </div>
          <div className={styles.stepRow}>
            <span className={step >= 1 ? styles.stepActive : ''}>1. Basic Info</span>
            <span className={step >= 2 ? styles.stepActive : ''}>2. Goal & Deadline</span>
            <span className={step >= 3 ? styles.stepActive : ''}>3. Media & Description</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {step === 1 ? (
            <>
              <label htmlFor='title'>Project Title</label>
              <input
                id='title'
                name='title'
                placeholder='AI Health Monitor for Rural Clinics'
                value={formData.title}
                onChange={onChange}
              />

              <label htmlFor='category'>Category</label>
              <select id='category' name='category' value={formData.category} onChange={onChange}>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </>
          ) : null}

          {step === 2 ? (
            <>
              <label htmlFor='goalAmount'>Funding Goal (USD)</label>
              <input
                id='goalAmount'
                name='goalAmount'
                type='number'
                min='1'
                placeholder='25000'
                value={formData.goalAmount}
                onChange={onChange}
              />

              <label htmlFor='deadline'>Deadline</label>
              <input
                id='deadline'
                name='deadline'
                type='date'
                value={formData.deadline}
                onChange={onChange}
              />
            </>
          ) : null}

          {step === 3 ? (
            <>


              <label htmlFor='projectImages'>Select Images From Device</label>
              <input
                id='projectImages'
                name='projectImages'
                type='file'
                accept='image/*'
                multiple
                onChange={handleImageFileChange}
              />

              {projectImageFiles.length > 0 ? (
                <p className={styles.fileInfo}>Selected files: {projectImageFiles.map(f => f.name).join(', ')}</p>
              ) : null}

              {imagePreviewUrls.length > 0 ? (
                <div className={styles.imagePreviewGrid}>
                  {imagePreviewUrls.map((url, idx) => (
                    <img key={idx} src={url} alt={`Preview ${idx + 1}`} className={styles.imagePreview} />
                  ))}
                </div>
              ) : null}

              <label htmlFor='description'>Detailed Description</label>
              <textarea
                id='description'
                name='description'
                rows='5'
                placeholder='Describe the impact, roadmap, and how funds will be used...'
                value={formData.description}
                onChange={onChange}
              />
            </>
          ) : null}

          {error ? <p className={styles.error}>{error}</p> : null}

          <div className={styles.actions}>
            <button type='button' className={styles.secondaryBtn} onClick={handleBack} disabled={step === 1}>
              Back
            </button>

            {step < 3 ? (
              <button type='button' className={styles.primaryBtn} onClick={handleNext}>
                Continue
              </button>
            ) : (
              <button type='submit' className={styles.primaryBtn} disabled={isSubmitting}>
                {isSubmitting ? 'Publishing...' : 'Publish Project'}
              </button>
            )}
          </div>
        </form>
      </div>
    </section>
  );
};

export default CreateProject;
