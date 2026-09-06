import { FormEvent, PointerEvent as ReactPointerEvent, ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { Pencil, Plus, Save as SaveIcon, Trash } from 'lucide-react';
import * as adminApi from '../../lib/adminApi';
import { publicAssetUrl } from '../../lib/backendApi';
import { emptyValueForFields } from '../../lib/schemaDefaults';
import type { FieldSchema } from '../../types/collectionSchema';
import SchemaForm from './SchemaForm';
import './CollectionAdminSection.css';
// Reused directly from the public site rather than re-invented — the
// whole point of the "film-rows" variant below is that this screen should
// look like /film, not like the post-sound poster grid it was first built
// to match. FilmListRow.tsx already sets this same precedent (a component
// importing a page's CSS file directly).
import '../../pages/FilmPage.css';

type CardPointerEvent = ReactPointerEvent<HTMLLIElement>;

interface CardDragState {
  slug: string;
  pointerId: number;
  startX: number;
  startY: number;
  originRect: DOMRect;
  active: boolean;
}

function slugify(value: string): string {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'untitled'
  );
}

interface CollectionAdminSectionProps {
  collectionId: string;
  label: string;
  /** Field key used as each card's title and to derive a new entry's slug. */
  titleKey: string;
  /** Field key (type 'image') used as each card's thumbnail, if any. */
  imageKey?: string;
  /** Field keys joined with " · " for each card's subtitle line. */
  metaKeys?: string[];
  /** Field key for a longer blurb line — 'film-rows' variant only. */
  blurbKey?: string;
  /**
   * 'grid' (default) mimics post-sound's poster-grid public page.
   * 'film-rows' mimics /film's actual layout (a thumbnail + title + meta +
   * blurb row) instead of forcing every collection into that same poster
   * look regardless of what its own public page actually looks like.
   */
  variant?: 'grid' | 'film-rows';
  /**
   * 'dialog' (default) is the original small popup form. 'full-page' splits
   * the screen between the form and a read-only live preview. 'inline'
   * drops the form pane entirely — renderPreview becomes the whole editor,
   * and every field click-to-edits directly on the rendered page itself
   * (via the onFieldChange passed into it).
   */
  editorMode?: 'dialog' | 'full-page' | 'inline';
  /** Required when editorMode is 'full-page' or 'inline'. In 'full-page'
   * mode this renders a read-only preview; in 'inline' mode, onFieldChange
   * is how it writes edits back (a field key + its new raw value — the
   * same shape sent to the backend, replacing that key wholesale). */
  renderPreview?: (
    formValue: Record<string, unknown>,
    entries: adminApi.RemoteEntry[],
    editingSlug: string | null,
    onFieldChange: (key: string, value: unknown) => void,
    token: string
  ) => ReactNode;
  /** 'inline' mode only — fields with no natural on-page click target
   * (boolean layout flags, a list-view-only blurb, etc). Rendered as a
   * small collapsible form above the editable page, so nothing in the
   * schema becomes unreachable just because it isn't visual. */
  advancedFieldKeys?: string[];
  token: string;
  /** Same handler AdminPage already uses for post-sound — a 401/403 here
   * should sign the whole admin session out too, not just this section. */
  onApiError: (err: unknown) => string;
}

// A generic, schema-driven collection editor — built from whatever
// GET /.../schema returns instead of a hand-written form per collection.
// Post-sound keeps its own bespoke implementation in AdminPage.tsx (it
// already works well and has real polish behind it); this is for every
// collection after it, starting with Film, so adding one doesn't mean
// hand-building an entire new admin screen each time.
function CollectionAdminSection({
  collectionId,
  label,
  titleKey,
  imageKey,
  metaKeys = [],
  blurbKey,
  variant = 'grid',
  editorMode = 'dialog',
  renderPreview,
  advancedFieldKeys = [],
  token,
  onApiError,
}: CollectionAdminSectionProps) {
  const [fields, setFields] = useState<FieldSchema[] | null>(null);
  const [entries, setEntries] = useState<adminApi.RemoteEntry[] | null>(null);
  const [loadError, setLoadError] = useState('');
  const [status, setStatus] = useState<{ message: string; error?: boolean } | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [formValue, setFormValue] = useState<Record<string, unknown>>({});
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [dirty, setDirty] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [draggedSlug, setDraggedSlug] = useState<string | null>(null);
  const gridRef = useRef<HTMLUListElement>(null);
  const dragRef = useRef<CardDragState | null>(null);

  const load = useCallback(async () => {
    try {
      const [schema, remote] = await Promise.all([adminApi.getSchema(collectionId, token), adminApi.listEntries(collectionId, token)]);
      setFields(schema.fields);
      setEntries(remote);
    } catch (err) {
      setLoadError(onApiError(err));
    }
  }, [collectionId, token, onApiError]);

  useEffect(() => {
    load();
  }, [load]);

  function openAdd() {
    if (!fields) return;
    setEditingSlug(null);
    setFormValue(emptyValueForFields(fields));
    setFormError('');
    setDialogOpen(true);
  }

  function openEdit(entry: adminApi.RemoteEntry) {
    if (!fields) return;
    setEditingSlug(entry.slug);
    setFormValue({ ...emptyValueForFields(fields), ...entry.data });
    setFormError('');
    setDialogOpen(true);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError('');

    const title = String(formValue[titleKey] ?? '').trim();
    if (!title) {
      setFormError(`${label} needs a value for its title field.`);
      return;
    }

    setSaving(true);
    try {
      const slug = editingSlug ?? slugify(title);
      if (editingSlug) {
        await adminApi.updateEntry(collectionId, editingSlug, formValue, token);
      } else {
        await adminApi.createEntry(collectionId, slug, formValue, token);
      }
      setDialogOpen(false);
      setStatus({ message: `Saved "${title}".` });
      await load();
    } catch (err) {
      setFormError(onApiError(err));
    } finally {
      setSaving(false);
    }
  }

  // 'inline' mode's write path — every click-to-edit control ultimately
  // calls this with the raw field key and its new raw value, same shape
  // handleSubmit already sends to the backend.
  function handleFieldChange(key: string, value: unknown) {
    setFormValue((prev) => ({ ...prev, [key]: value }));
  }

  async function handleDelete(entry: adminApi.RemoteEntry) {
    const title = String(entry.data[titleKey] ?? entry.slug);
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      await adminApi.deleteEntry(collectionId, entry.slug, token);
      setStatus({ message: `Removed "${title}".` });
      await load();
    } catch (err) {
      setStatus({ message: onApiError(err), error: true });
    }
  }

  // Same live-reorder-while-dragging approach as AdminPage's post-sound
  // grid, minus the featured/unfeatured group split — this collection is
  // always just one flat, ordered list.
  function reorderByPointer(draggedSlugArg: string, clientX: number, clientY: number) {
    const gridEl = gridRef.current;
    if (!entries || !gridEl) return;

    const others = entries.filter((entry) => entry.slug !== draggedSlugArg);
    const cards = gridEl.querySelectorAll<HTMLElement>('.admin-card:not(.admin-card-dragging)');

    let hitSlug: string | null = null;
    let closestSlug: string | null = null;
    let insertAfter = false;
    let closestDistance = Infinity;
    let maxBottom = -Infinity;
    let minTop = Infinity;

    cards.forEach((card) => {
      const box = card.getBoundingClientRect();
      if (clientX >= box.left && clientX <= box.right && clientY >= box.top && clientY <= box.bottom) {
        hitSlug = card.dataset.slug ?? null;
      }
      maxBottom = Math.max(maxBottom, box.bottom);
      minTop = Math.min(minTop, box.top);
      const cx = box.left + box.width / 2;
      const cy = box.top + box.height / 2;
      const distance = (clientX - cx) ** 2 + (clientY - cy) ** 2;
      if (distance < closestDistance) {
        closestDistance = distance;
        closestSlug = card.dataset.slug ?? null;
        insertAfter = clientX > cx;
      }
    });

    let insertAt = others.length;
    if (hitSlug !== null) {
      insertAt = others.findIndex((entry) => entry.slug === hitSlug);
    } else if (cards.length > 0 && clientY > maxBottom) {
      insertAt = others.length;
    } else if (cards.length > 0 && clientY < minTop) {
      insertAt = 0;
    } else if (closestSlug !== null) {
      const closestIndex = others.findIndex((entry) => entry.slug === closestSlug);
      insertAt = insertAfter ? closestIndex + 1 : closestIndex;
    }

    const draggedEntry = entries.find((entry) => entry.slug === draggedSlugArg);
    if (!draggedEntry) return;
    const next = [...others.slice(0, insertAt), draggedEntry, ...others.slice(insertAt)];

    const unchanged = next.length === entries.length && next.every((entry, i) => entry.slug === entries[i].slug);
    if (unchanged) return;

    setEntries(next);
    setDirty(true);
  }

  const DRAG_MOVE_THRESHOLD_PX = 5;

  function handleCardPointerDown(e: CardPointerEvent, entry: adminApi.RemoteEntry) {
    if (e.button !== 0) return;
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    dragRef.current = {
      slug: entry.slug,
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      originRect: rect,
      active: false,
    };
    el.setPointerCapture(e.pointerId);
  }

  function handleCardPointerMove(e: CardPointerEvent) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;
    const el = e.currentTarget;
    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;

    if (!drag.active) {
      if (Math.abs(dx) < DRAG_MOVE_THRESHOLD_PX && Math.abs(dy) < DRAG_MOVE_THRESHOLD_PX) return;
      drag.active = true;
      setDraggedSlug(drag.slug);
      el.style.position = 'fixed';
      el.style.left = `${drag.originRect.left}px`;
      el.style.top = `${drag.originRect.top}px`;
      el.style.width = `${drag.originRect.width}px`;
      el.style.height = `${drag.originRect.height}px`;
      el.style.zIndex = '200';
      el.style.transition = 'none';
    }

    el.style.transform = `translate(${dx}px, ${dy}px)`;
    reorderByPointer(drag.slug, e.clientX, e.clientY);
  }

  function handleCardPointerEnd(e: CardPointerEvent) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;
    const el = e.currentTarget;
    try {
      el.releasePointerCapture(e.pointerId);
    } catch {
      /* already released */
    }

    if (drag.active) {
      const floatingRect = el.getBoundingClientRect();
      el.style.position = '';
      el.style.left = '';
      el.style.top = '';
      el.style.width = '';
      el.style.height = '';
      el.style.zIndex = '';
      el.style.transform = 'none';
      void el.offsetWidth;
      const settledRect = el.getBoundingClientRect();
      const deltaX = floatingRect.left - settledRect.left;
      const deltaY = floatingRect.top - settledRect.top;
      el.style.transition = 'none';
      el.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
      requestAnimationFrame(() => {
        el.style.transition = 'transform 200ms ease';
        el.style.transform = '';
      });
      const clearTransition = () => {
        el.style.transition = '';
        el.removeEventListener('transitionend', clearTransition);
      };
      el.addEventListener('transitionend', clearTransition);
    }

    setDraggedSlug(null);
    dragRef.current = null;
  }

  async function saveOrder() {
    if (!entries) return;
    try {
      await adminApi.reorderEntries(
        collectionId,
        entries.map((e) => e.slug),
        token
      );
      setDirty(false);
      setStatus({ message: 'Order saved.' });
      await load();
    } catch (err) {
      setStatus({ message: onApiError(err), error: true });
    }
  }

  if (loadError) {
    return (
      <>
        <p className="admin-status admin-status-error">{loadError}</p>
        <button type="button" className="admin-btn admin-btn-secondary" onClick={load}>
          Retry
        </button>
      </>
    );
  }

  if (!fields || entries === null) {
    return <p className="admin-loading">Loading…</p>;
  }

  // Full takeover, not an overlay — this replaces the grid entirely while
  // open, so it reads as "you're now on the edit page" rather than "a
  // popup appeared on top of the list."
  if ((editorMode === 'full-page' || editorMode === 'inline') && dialogOpen) {
    const advancedFields = fields.filter((f) => advancedFieldKeys.includes(f.key));

    return (
      <form className="admin-editor-page" onSubmit={handleSubmit}>
        <div className="admin-editor-header">
          <button type="button" className="admin-btn admin-btn-secondary" onClick={() => setDialogOpen(false)}>
            ← Cancel
          </button>
          <h1>{editingSlug ? `Edit ${label}` : `Add ${label}`}</h1>
          <button type="submit" className="admin-btn admin-btn-primary" disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>

        {formError && <p className="admin-form-error admin-editor-error">{formError}</p>}

        {editorMode === 'inline' ? (
          <>
            {advancedFields.length > 0 && (
              <div className="admin-editor-advanced">
                <button type="button" className="admin-editor-advanced-toggle" onClick={() => setAdvancedOpen((open) => !open)}>
                  {advancedOpen ? '▾' : '▸'} Other settings
                  <span className="admin-editor-advanced-hint">— fields with nothing to click on the page itself</span>
                </button>
                {advancedOpen && (
                  <div className="admin-editor-advanced-body">
                    <SchemaForm fields={advancedFields} value={formValue} onChange={setFormValue} token={token} />
                  </div>
                )}
              </div>
            )}
            <div className="admin-editor-inline-frame">{renderPreview?.(formValue, entries, editingSlug, handleFieldChange, token)}</div>
          </>
        ) : (
          <div className="admin-editor-body">
            <div className="admin-editor-form-pane">
              <SchemaForm fields={fields} value={formValue} onChange={setFormValue} token={token} />
            </div>
            <div className="admin-editor-preview-pane">
              <p className="admin-editor-preview-label">Live Preview</p>
              <div className="admin-editor-preview-frame">{renderPreview?.(formValue, entries, editingSlug, handleFieldChange, token)}</div>
            </div>
          </div>
        )}
      </form>
    );
  }

  return (
    <>
      {status && <p className={`admin-status ${status.error ? 'admin-status-error' : ''}`}>{status.message}</p>}

      <ul className={variant === 'film-rows' ? 'film-list admin-film-list' : 'admin-grid'} ref={gridRef}>
        {entries.map((entry) => {
          const imgValue = imageKey ? (entry.data[imageKey] as string | undefined) : undefined;
          const title = String(entry.data[titleKey] ?? entry.slug);
          const meta = metaKeys
            .map((key) => entry.data[key])
            .filter(Boolean)
            .join(' · ');
          const liClassName = `admin-card${variant === 'film-rows' ? ' admin-film-row' : ''}${
            draggedSlug === entry.slug ? ' admin-card-dragging' : ''
          }`;
          // React reads `key` off of a spread props object at runtime, but
          // warns about it (keys must "look" static in the JSX source for
          // its diffing heuristics) — passed directly below instead.
          const liProps = {
            'data-slug': entry.slug,
            className: liClassName,
            onPointerDown: (e: CardPointerEvent) => handleCardPointerDown(e, entry),
            onPointerMove: handleCardPointerMove,
            onPointerUp: handleCardPointerEnd,
            onPointerCancel: handleCardPointerEnd,
          };

          if (variant === 'film-rows') {
            const blurb = blurbKey ? (entry.data[blurbKey] as string | undefined) : undefined;
            const imgContain = Boolean(entry.data.imgContain);
            return (
              <li key={entry.slug} {...liProps}>
                <div className="film-list-row">
                  {imgValue && (
                    <div className={`film-list-thumb${imgContain ? ' film-list-thumb--contain' : ''}`}>
                      <img
                        src={`${publicAssetUrl(imgValue)}?v=${entry.updatedAt}`}
                        alt=""
                        loading="lazy"
                        draggable={false}
                        className={imgContain ? 'img-contain' : undefined}
                      />
                    </div>
                  )}
                  <div className="film-list-copy">
                    <h2 className="film-list-title">{title}</h2>
                    {meta && <p className="film-list-meta">{meta}</p>}
                    {blurb && <p className="film-list-blurb">{blurb}</p>}
                  </div>
                  <div className="admin-card-actions admin-film-row-actions" onPointerDown={(e) => e.stopPropagation()}>
                    <button type="button" className="admin-icon-btn" onClick={() => openEdit(entry)} aria-label="Edit">
                      <Pencil size={15} />
                    </button>
                    <button
                      type="button"
                      className="admin-icon-btn admin-icon-btn-danger"
                      onClick={() => handleDelete(entry)}
                      aria-label="Delete"
                    >
                      <Trash size={15} />
                    </button>
                  </div>
                </div>
              </li>
            );
          }

          return (
            <li key={entry.slug} {...liProps}>
              <div className="admin-card-image-wrap">
                {imgValue ? (
                  <img src={`${publicAssetUrl(imgValue)}?v=${entry.updatedAt}`} alt="" loading="lazy" draggable={false} />
                ) : (
                  <div className="admin-card-placeholder" />
                )}
                <div className="admin-card-overlay">
                  <p className="admin-card-title">{title}</p>
                  {meta && <p className="admin-card-meta">{meta}</p>}
                </div>
                <div className="admin-card-actions" onPointerDown={(e) => e.stopPropagation()}>
                  <button type="button" className="admin-icon-btn" onClick={() => openEdit(entry)} aria-label="Edit">
                    <Pencil size={15} />
                  </button>
                  <button
                    type="button"
                    className="admin-icon-btn admin-icon-btn-danger"
                    onClick={() => handleDelete(entry)}
                    aria-label="Delete"
                  >
                    <Trash size={15} />
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="admin-fab-group">
        {dirty && (
          <button type="button" className="admin-fab admin-fab-save" onClick={saveOrder} aria-label="Save order" title="Save order">
            <SaveIcon size={24} />
          </button>
        )}
        <button type="button" className="admin-fab" onClick={openAdd} aria-label={`Add ${label}`}>
          <Plus size={26} />
        </button>
      </div>

      {editorMode === 'dialog' && dialogOpen && (
        <div className="admin-dialog-backdrop" onClick={() => setDialogOpen(false)}>
          <form className="admin-dialog" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
            <h2>{editingSlug ? `Edit ${label}` : `Add ${label}`}</h2>

            <SchemaForm fields={fields} value={formValue} onChange={setFormValue} token={token} />

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
    </>
  );
}

export default CollectionAdminSection;
