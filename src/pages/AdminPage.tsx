import { FormEvent, useCallback, useEffect, useState } from 'react';
import * as adminApi from '../lib/adminApi';
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

function AdminPage() {
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

  const load = useCallback(async () => {
    try {
      const remote = await adminApi.listEntries('post-sound');
      setEntries(remote.map(toFlat));
    } catch (err) {
      setLoadError((err as Error).message);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

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
        const asset = await adminApi.uploadAsset(compressed, `${slug}.jpg`);
        data.imgPath = asset.r2Key;
      } else if (editingSlug) {
        data.imgPath = entries?.find((e) => e.slug === editingSlug)?.imgPath ?? '';
      }

      if (editingSlug) {
        await adminApi.updateEntry('post-sound', editingSlug, data);
      } else {
        await adminApi.createEntry('post-sound', slug, data);
      }

      setDialogOpen(false);
      setStatus({ message: `Saved "${form.title}".` });
      await load();
    } catch (err) {
      setFormError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(entry: PostSoundEntry) {
    if (!confirm(`Delete "${entry.title}"? This cannot be undone.`)) return;
    try {
      await adminApi.deleteEntry('post-sound', entry.slug);
      setStatus({ message: `Removed "${entry.title}".` });
      await load();
    } catch (err) {
      setStatus({ message: (err as Error).message, error: true });
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
    if (!entries) return;
    try {
      await adminApi.reorderEntries(
        'post-sound',
        entries.map((e) => e.slug)
      );
      setOrderDirty(false);
      setStatus({ message: 'Order saved.' });
    } catch (err) {
      setStatus({ message: (err as Error).message, error: true });
    }
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
        {orderDirty && (
          <button type="button" className="admin-btn admin-btn-secondary" onClick={saveOrder}>
            Save Order
          </button>
        )}
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
