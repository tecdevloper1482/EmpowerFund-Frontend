import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import styles from './Profile.module.css';
import fallbackImage from '../../assets/hero.png';

const Profile = () => {
  const navigate = useNavigate();
	const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [profileForm, setProfileForm] = useState({ fullname: '' });
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const apiBaseUrl = useMemo(() => import.meta.env.VITE_API_URL || 'http://localhost:5000/api', []);

  const storedAuth = localStorage.getItem('empowerfund_auth');
  const auth = storedAuth ? JSON.parse(storedAuth) : null;

  const showToast = (type, message) => {
    setToast({ type, message });
    window.setTimeout(() => setToast(null), 2600);
  };

  const handleLogout = () => {
    localStorage.removeItem('empowerfund_auth');
    window.dispatchEvent(new Event('empowerfund-auth-changed'));
    navigate('/login');
  };

  useEffect(() => {
    const controller = new AbortController();

    const fetchProjects = async () => {
      if (!auth || !auth.token) {
        setError('You must be logged in to view your projects.');
        return;
      }

      setIsLoading(true);
      setError('');

      try {
        const response = await fetch(`${apiBaseUrl}/profile`, {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
          signal: controller.signal,
        });

        const data = await response.json().catch(() => []);

        if (!response.ok) {
          setError(data?.message || 'Failed to load profile');
          setProjects([]);
          return;
        }

        setUser(data.user || null);
        setProfileForm({
          fullname: data?.user?.fullname || '',
        });
        setProjects(Array.isArray(data.projects) ? data.projects : []);
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
  }, [apiBaseUrl, auth?.token]);

  const handleDelete = async (projectId) => {
    try {
      const response = await fetch(`${apiBaseUrl}/projects/${projectId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete project');
      }

      setProjects((prev) => prev.filter((project) => project._id !== projectId));
      showToast('success', 'Project deleted successfully.');
    } catch (error) {
      setError(error.message);
      showToast('error', error.message || 'Unable to delete project.');
    }
  };

  const openDeleteConfirm = (project) => {
    setDeleteTarget(project);
  };

  const closeDeleteConfirm = () => {
    setDeleteTarget(null);
  };

  const confirmDeleteProject = async () => {
    if (!deleteTarget?._id) {
      return;
    }

    await handleDelete(deleteTarget._id);
    setDeleteTarget(null);
  };

  const handleProfileSave = async (event) => {
    event.preventDefault();

    if (!profileForm.fullname.trim()) {
      showToast('error', 'Full name is required.');
      return;
    }

    setIsSavingProfile(true);
    try {
      const response = await fetch(`${apiBaseUrl}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({
          fullname: profileForm.fullname.trim(),
        }),
      });

      const data = await response.json().catch(() => null);
      if (!response.ok) {
        showToast('error', data?.message || 'Failed to update profile.');
        return;
      }

      setUser(data.user);

      const mergedAuth = {
        ...(auth || {}),
        fullname: data.user.fullname,
      };
      localStorage.setItem('empowerfund_auth', JSON.stringify(mergedAuth));
      window.dispatchEvent(new Event('empowerfund-auth-changed'));

      setShowEditDialog(false);
      showToast('success', data?.message || 'Profile updated successfully.');
    } catch {
      showToast('error', 'Unable to connect to backend API.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async (event) => {
    event.preventDefault();

    if (!passwordForm.oldPassword || !passwordForm.newPassword || !passwordForm.confirmNewPassword) {
      showToast('error', 'All password fields are required.');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
      showToast('error', 'New password and confirm password must match.');
      return;
    }

    setIsChangingPassword(true);
    try {
      const response = await fetch(`${apiBaseUrl}/profile/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify(passwordForm),
      });

      const data = await response.json().catch(() => null);
      if (!response.ok) {
        showToast('error', data?.message || 'Failed to change password.');
        return;
      }

      setShowPasswordDialog(false);
      setPasswordForm({ oldPassword: '', newPassword: '', confirmNewPassword: '' });
      showToast('success', data?.message || 'Password changed successfully.');
    } catch {
      showToast('error', 'Unable to connect to backend API.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const isInvestor = user?.role === 'Investor';

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <h1>User Profile</h1>
        <p>Manage your account details and security settings.</p>
      </header>

      {toast ? <div className={`${styles.toast} ${styles[toast.type]}`}>{toast.message}</div> : null}

      <div className={styles.profileCard}>
        <div className={styles.profileInfo}>
          <h2>Account Details</h2>
          <div className={styles.detailsGrid}>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Full Name</span>
              <span className={styles.detailValue}>{user?.fullname?.trim() || 'Not provided'}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Email Address</span>
              <span className={styles.detailValue}>{user?.email?.trim() || 'Not provided'}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Role</span>
              <span className={styles.roleBadge}>{user?.role || 'Not assigned'}</span>
            </div>
          </div>
        </div>

        <div className={styles.profileActions}>
          <button type='button' className={styles.actionBtn} onClick={() => setShowEditDialog(true)}>
            Edit Profile
          </button>
          <button type='button' className={styles.secondaryActionBtn} onClick={() => setShowPasswordDialog(true)}>
            Change Password
          </button>
          <button type='button' className={`${styles.secondaryActionBtn} ${styles.logoutProfileBtn}`} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      {error ? <p className={styles.error}>{error}</p> : null}
      {isLoading ? <p className={styles.info}>Loading profile...</p> : null}

      {!isInvestor && (
        <section className={styles.section}>
          <h2>Created Projects</h2>
          {!isLoading && !error && projects.length === 0 ? (
            <p className={styles.info}>No projects created yet.</p>
          ) : null}

          <div className={styles.grid}>
            {projects.map((project) => {
              const goalAmount = Number(project.goalAmount || 0);
              const currentAmount = Number(project.currentAmount || 0);
              const progress = goalAmount > 0 ? Math.min(100, Math.round((currentAmount / goalAmount) * 100)) : 0;
              const projectImageSrc = project.imageURLs?.[0] || project.imageURL || fallbackImage;

              return (
                <article key={project._id} className={styles.card}>
                  <img
                    src={projectImageSrc}
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

                    <div className={styles.progressTrack}>
                      <span style={{ width: `${progress}%` }} />
                    </div>

                    <p className={styles.amount}>
                      ₹{currentAmount.toLocaleString()} / ₹{goalAmount.toLocaleString()}
                    </p>

                    <Link to={`/projects/${project._id}`} className={styles.viewBtn}>
                      View Project
                    </Link>

                    <div className={styles.actions}>
                      <button type='button' onClick={() => openDeleteConfirm(project)}>
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {showEditDialog ? (
        <div className={styles.modalOverlay}>
          <form className={styles.modalCard} onSubmit={handleProfileSave}>
            <h3>Edit Profile</h3>
            <label htmlFor='fullname'>Full Name</label>
            <input
              id='fullname'
              placeholder='Enter full name'
              value={profileForm.fullname}
              onChange={(event) => setProfileForm((prev) => ({ ...prev, fullname: event.target.value }))}
            />

            <div className={styles.modalActions}>
              <button type='button' className={styles.ghostBtn} onClick={() => setShowEditDialog(false)}>
                Cancel
              </button>
              <button type='submit' className={styles.actionBtn} disabled={isSavingProfile}>
                {isSavingProfile ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {showPasswordDialog ? (
        <div className={styles.modalOverlay}>
          <form className={styles.modalCard} onSubmit={handleChangePassword}>
            <h3>Change Password</h3>
            <label htmlFor='oldPassword'>Old Password</label>
            <input
              id='oldPassword'
              type='password'
              placeholder='Enter your current password'
              value={passwordForm.oldPassword}
              onChange={(event) => setPasswordForm((prev) => ({ ...prev, oldPassword: event.target.value }))}
            />

            <label htmlFor='newPassword'>New Password</label>
            <input
              id='newPassword'
              type='password'
              placeholder='Enter a new password'
              value={passwordForm.newPassword}
              onChange={(event) => setPasswordForm((prev) => ({ ...prev, newPassword: event.target.value }))}
            />

            <label htmlFor='confirmNewPassword'>Confirm New Password</label>
            <input
              id='confirmNewPassword'
              type='password'
              placeholder='Re-enter new password'
              value={passwordForm.confirmNewPassword}
              onChange={(event) => setPasswordForm((prev) => ({ ...prev, confirmNewPassword: event.target.value }))}
            />

            <div className={styles.modalActions}>
              <button type='button' className={styles.ghostBtn} onClick={() => setShowPasswordDialog(false)}>
                Cancel
              </button>
              <button type='submit' className={styles.actionBtn} disabled={isChangingPassword}>
                {isChangingPassword ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {deleteTarget ? (
        <div className={styles.modalOverlay}>
          <div className={styles.modalCard}>
            <h3>Delete Project</h3>
            <p className={styles.deleteWarning}>
              Are you sure you want to delete <strong>{deleteTarget.title}</strong>? This action cannot be undone.
            </p>

            <div className={styles.modalActions}>
              <button type='button' className={styles.ghostBtn} onClick={closeDeleteConfirm}>
                Cancel
              </button>
              <button type='button' className={styles.deleteBtn} onClick={confirmDeleteProject}>
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
};

export default Profile;
