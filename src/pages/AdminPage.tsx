import { FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import * as adminApi from '../lib/adminApi';
import { AdminApiError } from '../lib/adminApi';
import { publicAssetUrl } from '../lib/backendApi';
import { compressImage } from '../lib/compressImage';
import './AdminPage.css';

interface PostSoundEntry {
  slug: string;
  title: string;
  role: string;
  type: string;
  year: string;
  link: string;
  imgPath: string;
  featured: boolean;
  updatedAt: number;
}

function toFlat(entry: adminApi.RemoteEntry): PostSoundEntry {
  return {
    slug: entry.slug,
    title: String(entry.data.title ?? ''),
    role: String(entry.data.role ?? ''),
    type: String(entry.data.type ?? 'Short'),
    year: String(entry.data.year ?? ''),
    link: String(entry.data.link ?? ''),
    imgPath: String(entry.data.imgPath ?? ''),
    featured: entry.data.featured === true,
    updatedAt: entry.updatedAt,
  };
}

function slugify(value: string): string {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'untitled'
  );
}

const EMPTY_FORM = { title: '', role: '', type: 'Short', year: '', link: '', featured: true };
const GOOGLE_SCRIPT_ID = 'google-identity-script';
const TOKEN_STORAGE_KEY = 'admin-google-id-token';
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

// Google's own "Sign in with Google" widget, loaded the same way this
// project already loads Cloudflare Turnstile (see AboutPage.tsx): inject
// the script once, render the button once it's ready. The token it hands
// back is sent straight to site-assets-backend as a Bearer header — no
// proxy, no server-side piece on this site at all.
function useGoogleSignIn(onToken: (token: string) => void) {
  const buttonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;

    const renderButton = () => {
      if (!window.google || !buttonRef.current) return;
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (response) => onToken(response.credential),
      });
      window.google.accounts.id.renderButton(buttonRef.current, { theme: 'outline', size: 'large' });
    };

    if (window.google) {
      renderButton();
      return;
    }

    const existingScript = document.getElementById(GOOGLE_SCRIPT_ID) as HTMLScriptElement | null;
    if (existingScript) {
      existingScript.addEventListener('load', renderButton);
      return () => existingScript.removeEventListener('load', renderButton);
    }

    const script = document.createElement('script');
    script.id = GOOGLE_SCRIPT_ID;
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.addEventListener('load', renderButton);
    document.head.appendChild(script);

    return () => script.removeEventListener('load', renderButton);
  }, [onToken]);

  return buttonRef;
}

function AdminPage() {
  const [token, setToken] = useState<string | null>(() => sessionStorage.getItem(TOKEN_STORAGE_KEY));
  const [entries, setEntries] = useState<PostSoundEntry[] | null>(null);
  const [loadError, setLoadError] = useState('');
  const [status, setStatus] = useState<{ message: string; error?: boolean } | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [orderDirty, setOrderDirty] = useState(false);
  const [draggedSlug, setDraggedSlug] = useState<string | null>(null);

  const handleToken = useCallback((newToken: string) => {
    sessionStorage.setItem(TOKEN_STORAGE_KEY, newToken);
    setToken(newToken);
  }, []);

  const signInButtonRef = useGoogleSignIn(handleToken);

  const signOut = useCallback(() => {
    sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    window.google?.accounts.id.disableAutoSelect();
    setToken(null);
    setEntries(null);
  }, []);

  // Any call that comes back 401/403 means the token expired or was
  // rejected — drop it and send the person back to the sign-in screen
  // rather than showing a confusing error inline.
  const handleApiError = useCallback(
    (err: unknown) => {
      if (err instanceof AdminApiError && (err.status === 401 || err.status === 403)) {
        signOut();
        return 'Your session expired. Please sign in again.';
      }
      return (err as Error).message;
    },
    [signOut]
  );

  const load = useCallback(
    async (activeToken: string) => {
      try {
        const remote = await adminApi.listEntries('post-sound', activeToken);
        setEntries(remote.map(toFlat));
      } catch (err) {
        setLoadError(handleApiError(err));
      }
    },
    [handleApiError]
  );

  useEffect(() => {
    if (token) load(token);
  }, [token, load]);

  function openAdd() {
    setEditingSlug(null);
    setForm(EMPTY_FORM);
    setImageFile(null);
    setFormError('');
    setDialogOpen(true);
  }

  function openEdit(entry: PostSoundEntry) {
    setEditingSlug(entry.slug);
    setForm({
      title: entry.title,
      role: entry.role,
      type: entry.type,
      year: entry.year,
      link: entry.link,
      featured: entry.featured,
    });
    setImageFile(null);
    setFormError('');
    setDialogOpen(true);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError('');
    if (!token) return;

    if (!form.title.trim() || !form.role.trim()) {
      setFormError('Title and role are required.');
      return;
    }
    if (!editingSlug && !imageFile) {
      setFormError('An image is required.');
      return;
    }

    setSaving(true);
    try {
      const data: Record<string, unknown> = {
        title: form.title.trim(),
        role: form.role.trim(),
        type: form.type,
        year: form.year.trim(),
        link: form.link.trim(),
        featured: form.featured,
      };

      const slug = editingSlug ?? slugify(form.title);

      if (imageFile) {
        const compressed = await compressImage(imageFile);
        const asset = await adminApi.uploadAsset(compressed, `${slug}.jpg`, token);
        data.imgPath = asset.r2Key;
      } else if (editingSlug) {
        data.imgPath = entries?.find((e) => e.slug === editingSlug)?.imgPath ?? '';
      }

      if (editingSlug) {
        await adminApi.updateEntry('post-sound', editingSlug, data, token);
      } else {
        await adminApi.createEntry('post-sound', slug, data, token);
      }

      setDialogOpen(false);
      setStatus({ message: `Saved "${form.title}".` });
      await load(token);
    } catch (err) {
      setFormError(handleApiError(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(entry: PostSoundEntry) {
    if (!token || !confirm(`Delete "${entry.title}"? This cannot be undone.`)) return;
    try {
      await adminApi.deleteEntry('post-sound', entry.slug, token);
      setStatus({ message: `Removed "${entry.title}".` });
      await load(token);
    } catch (err) {
      setStatus({ message: handleApiError(err), error: true });
    }
  }

  function handleDropOn(targetSlug: string) {
    if (!draggedSlug || draggedSlug === targetSlug || !entries) return;
    const fromIndex = entries.findIndex((e) => e.slug === draggedSlug);
    const toIndex = entries.findIndex((e) => e.slug === targetSlug);
    const next = [...entries];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    setEntries(next);
    setOrderDirty(true);
  }

  async function saveOrder() {
    if (!entries || !token) return;
    try {
      await adminApi.reorderEntries(
        'post-sound',
        entries.map((e) => e.slug),
        token
      );
      setOrderDirty(false);
      setStatus({ message: 'Order saved.' });
    } catch (err) {
      setStatus({ message: handleApiError(err), error: true });
    }
  }

  if (!GOOGLE_CLIENT_ID) {
    return (
      <main className="admin-page">
        <p className="admin-status admin-status-error">
          Admin sign-in isn't configured — VITE_GOOGLE_CLIENT_ID is missing.
        </p>
      </main>
    );
  }

  if (!token) {
    return (
      <main className="admin-page admin-page-signin">
        <h1>Post-Sound Admin</h1>
        <p className="admin-page-subtitle">Sign in with an allowlisted Google account to continue.</p>
        <div ref={signInButtonRef} />
      </main>
    );
  }

  if (loadError) {
    return (
      <main className="admin-page">
        <p className="admin-status admin-status-error">{loadError}</p>
      </main>
    );
  }

  if (entries === null) {
    return (
      <main className="admin-page">
        <p className="admin-loading">Loading…</p>
      </main>
    );
  }

  return (
    <main className="admin-page">
      <header className="admin-page-header">
        <div>
          <h1>Post-Sound Admin</h1>
          <p className="admin-page-subtitle">Editing live production content on brandonlien.com.</p>
        </div>
        <div className="admin-header-actions">
          {orderDirty && (
            <button type="button" className="admin-btn admin-btn-secondary" onClick={saveOrder}>
              Save Order
            </button>
          )}
          <button type="button" className="admin-btn admin-btn-secondary" onClick={signOut}>
            Sign Out
          </button>
        </div>
      </header>

      {status && <p className={`admin-status ${status.error ? 'admin-status-error' : ''}`}>{status.message}</p>}

      <ul className="admin-grid">
        {entries.map((entry) => (
          <li
            key={entry.slug}
            className="admin-card"
            draggable
            onDragStart={() => setDraggedSlug(entry.slug)}
            onDragEnd={() => setDraggedSlug(null)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDropOn(entry.slug)}
          >
            <div className="admin-card-image-wrap">
              {entry.imgPath ? (
                <img src={`${publicAssetUrl(entry.imgPath)}?v=${entry.updatedAt}`} alt="" loading="lazy" />
              ) : (
                <div className="admin-card-placeholder" />
              )}
              <div className="admin-card-overlay">
                <p className="admin-card-title">{entry.title}</p>
                <p className="admin-card-meta">{[entry.role, entry.type, entry.year].filter(Boolean).join(' · ')}</p>
              </div>
              {entry.featured && <span className="admin-card-badge">Featured</span>}
              <div className="admin-card-actions">
                <button type="button" className="admin-icon-btn" onClick={() => openEdit(entry)} aria-label="Edit">
                  ✎
                </button>
                <button
                  type="button"
                  className="admin-icon-btn admin-icon-btn-danger"
                  onClick={() => handleDelete(entry)}
                  aria-label="Delete"
                >
                  ✕
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <button type="button" className="admin-fab" onClick={openAdd} aria-label="Add credit">
        +
      </button>

      {dialogOpen && (
        <div className="admin-dialog-backdrop" onClick={() => setDialogOpen(false)}>
          <form className="admin-dialog" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
            <h2>{editingSlug ? 'Edit Credit' : 'Add Credit'}</h2>

            <label>
              Title
              <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </label>

            <label>
              Role
              <input type="text" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} required />
            </label>

            <label>
              Type
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                <option value="Feature">Feature</option>
                <option value="Short">Short</option>
                <option value="Vertical">Vertical</option>
              </select>
            </label>

            <label>
              Year
              <input type="text" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} />
            </label>

            <label>
              Link
              <input type="url" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} />
            </label>

            <label className="admin-checkbox-label">
              <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
              Featured
            </label>

            <label>
              Image {editingSlug ? '(optional — leave blank to keep current)' : '(required)'}
              <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] ?? null)} />
            </label>

            {formError && <p className="admin-form-error">{formError}</p>}

            <div className="admin-dialog-actions">
              <button type="button" className="admin-btn admin-btn-secondary" onClick={() => setDialogOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="admin-btn admin-btn-primary" disabled={saving}>
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}

export default AdminPage;
