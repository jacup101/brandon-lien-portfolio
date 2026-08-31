import { FormEvent, PointerEvent as ReactPointerEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { LogOut, Pencil, Plus, Save as SaveIcon, Star, Trash } from 'lucide-react';
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

// The inverse of toFlat — updateEntry always overwrites every field (see
// site-assets-backend's shapeData), so a featured-only change still has to
// resend the entry's other fields as they currently stand here.
function toData(entry: PostSoundEntry): Record<string, unknown> {
  return {
    title: entry.title,
    role: entry.role,
    type: entry.type,
    year: entry.year,
    link: entry.link,
    imgPath: entry.imgPath,
    featured: entry.featured,
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

interface GoogleProfile {
  name?: string;
  picture?: string;
  email?: string;
}

// A Google ID token is a JWT — its payload (the middle, base64url-encoded
// segment) already carries standard profile claims (name/picture/email),
// so there's no need to ask the backend for anything just to show who's
// signed in. This never verifies the signature — it doesn't need to, this
// is purely cosmetic display; the backend still independently verifies the
// token itself on every real API call.
function decodeGoogleProfile(token: string): GoogleProfile | null {
  try {
    const payload = token.split('.')[1];
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
        .join('')
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

// Google's brand guidelines ask that a custom "Sign in with Google" button
// still show their "G" mark — this is that, sized to sit inline in our button.
function GoogleGlyph() {
  return (
    <svg className="admin-google-glyph" width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.57 2.7-3.87 2.7-6.62Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.96v2.33A9 9 0 0 0 9 18Z"
      />
      <path
        fill="#FBBC05"
        d="M3.95 10.7a5.4 5.4 0 0 1 0-3.4V4.97H.96a9 9 0 0 0 0 8.06l2.99-2.33Z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.51.46 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.97L3.95 7.3C4.66 5.17 6.65 3.58 9 3.58Z"
      />
    </svg>
  );
}

type CardPointerEvent = ReactPointerEvent<HTMLLIElement>;

interface CardDragState {
  slug: string;
  // Which section this card was picked up from — featured and non-featured
  // cards live in two separate <ul>s now, so reordering has to stay scoped
  // to whichever one the drag started in (see reorderByPointer).
  group: 'featured' | 'unfeatured';
  pointerId: number;
  startX: number;
  startY: number;
  originRect: DOMRect;
  active: boolean;
}

const EMPTY_FORM = { title: '', role: '', type: 'Short', year: '', link: '', featured: true };
const GOOGLE_SCRIPT_ID = 'google-identity-script';
const TOKEN_STORAGE_KEY = 'admin-google-id-token';
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

// Only post-sound is actually wired up to site-assets-backend right now
// (see that repo's README) — film/music are listed so the nav reflects
// where this is headed, but they're inert until there's a real collection
// behind them.
type AdminSectionId = 'post-sound' | 'film' | 'music';

const ADMIN_SECTIONS: { id: AdminSectionId; label: string; comingSoon?: boolean }[] = [
  { id: 'post-sound', label: 'Post-Sound' },
  { id: 'film', label: 'Film', comingSoon: true },
  { id: 'music', label: 'Music', comingSoon: true },
];

// Google's own "Sign in with Google" widget, loaded the same way this
// project already loads Cloudflare Turnstile (see AboutPage.tsx): inject
// the script once, render the button once it's ready. The token it hands
// back is sent straight to site-assets-backend as a Bearer header — no
// proxy, no server-side piece on this site at all.
//
// The widget renders inside a cross-origin iframe, so its visuals can't be
// CSS'd — and when the browser already has a Google session, Google forces
// its own light "Sign in as <name>" pill regardless of the theme option,
// which doesn't match this site's dark theme at all. So instead of showing
// it, we render it at opacity: 0, exactly on top of our own gold-styled
// button (see AdminPage.css's .admin-google-btn-*). A click lands on the
// real (invisible) Google button underneath — this is still a genuine user
// click driving Google's real flow, just visually skinned as our own button.
function useGoogleSignIn(onToken: (token: string) => void) {
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [scriptError, setScriptError] = useState(false);

  // Just loads the script once, script tag persists for the page's lifetime.
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;
    if (window.google) {
      setScriptLoaded(true);
      return;
    }

    const onLoad = () => setScriptLoaded(true);
    // A blocked or failed request (ad blocker, offline, network filter)
    // never fires 'load' — without this, the page would just sit there
    // with no button and no explanation.
    const onError = () => setScriptError(true);

    const existingScript = document.getElementById(GOOGLE_SCRIPT_ID) as HTMLScriptElement | null;
    if (existingScript) {
      existingScript.addEventListener('load', onLoad);
      existingScript.addEventListener('error', onError);
      return () => {
        existingScript.removeEventListener('load', onLoad);
        existingScript.removeEventListener('error', onError);
      };
    }

    const script = document.createElement('script');
    script.id = GOOGLE_SCRIPT_ID;
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.addEventListener('load', onLoad);
    script.addEventListener('error', onError);
    document.head.appendChild(script);

    return () => {
      script.removeEventListener('load', onLoad);
      script.removeEventListener('error', onError);
    };
  }, []);

  // A callback ref on purpose, not a plain useRef + a one-time effect: this
  // page swaps the sign-in screen in and out of the DOM (e.g. after a
  // rejected sign-in sends the user back here), so the button's container
  // gets unmounted and a *new* DOM node takes its place each time. A plain
  // effect only fires once and would render into a node that's since been
  // thrown away, leaving the new one permanently empty. A callback ref
  // re-fires every time React (re)attaches it to a node, and also whenever
  // its own identity changes — which we use to cover the case where the
  // node mounts before the script has finished loading.
  const buttonRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (!node || !window.google || !scriptLoaded || !GOOGLE_CLIENT_ID) return;
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (response) => onToken(response.credential),
      });
      window.google.accounts.id.renderButton(node, {
        theme: 'filled_black',
        shape: 'pill',
        size: 'large',
        text: 'signin_with',
        logo_alignment: 'center',
        width: 260,
      });
    },
    [onToken, scriptLoaded]
  );

  return { buttonRef, scriptError };
}

function AdminPage() {
  const [token, setToken] = useState<string | null>(() => sessionStorage.getItem(TOKEN_STORAGE_KEY));
  const profile = useMemo(() => (token ? decodeGoogleProfile(token) : null), [token]);
  const [avatarError, setAvatarError] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = useState<AdminSectionId>('post-sound');
  const [signInNotice, setSignInNotice] = useState('');
  const [entries, setEntries] = useState<PostSoundEntry[] | null>(null);
  const [loadError, setLoadError] = useState('');
  const [status, setStatus] = useState<{ message: string; error?: boolean } | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [dirty, setDirty] = useState(false);
  const [draggedSlug, setDraggedSlug] = useState<string | null>(null);
  const featuredGridRef = useRef<HTMLUListElement>(null);
  const unfeaturedGridRef = useRef<HTMLUListElement>(null);
  const dragRef = useRef<CardDragState | null>(null);
  // Snapshot of each entry's saved `featured` value, taken whenever entries
  // are (re)loaded from the server — lets saveChanges tell "toggled locally,
  // not yet saved" apart from "already matches the server," so it only
  // sends updateEntry calls for the entries that actually changed.
  const savedFeaturedRef = useRef<Map<string, boolean>>(new Map());

  // Tracks whether the *current* token has ever successfully loaded data —
  // a ref, not state, so updating it doesn't retrigger the callbacks below
  // (see handleApiError). Lets a 401/403 be told apart: rejected on the
  // very first request after signing in (a bad/disallowed account) versus
  // rejected after previously working (an actually-expired session).
  const authenticatedRef = useRef(false);

  const handleToken = useCallback((newToken: string) => {
    authenticatedRef.current = false;
    setAvatarError(false);
    sessionStorage.setItem(TOKEN_STORAGE_KEY, newToken);
    setToken(newToken);
  }, []);

  const { buttonRef: signInButtonRef, scriptError: signInScriptError } = useGoogleSignIn(handleToken);

  const signOut = useCallback((notice?: string) => {
    authenticatedRef.current = false;
    sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    window.google?.accounts.id.disableAutoSelect();
    setToken(null);
    setEntries(null);
    setLoadError('');
    setSignInNotice(notice ?? '');
  }, []);

  // Any call that comes back 401/403 means the token was rejected — drop it
  // and send the person back to the sign-in screen (with an explanation)
  // rather than showing a confusing error inline. Anything else (network
  // failure, 5xx) is left on screen for a retry, since signing out again
  // wouldn't fix it.
  const handleApiError = useCallback(
    (err: unknown) => {
      if (err instanceof AdminApiError && (err.status === 401 || err.status === 403)) {
        const notice = authenticatedRef.current
          ? 'Your session expired. Please sign in again.'
          : "That Google account isn't authorized for admin access.";
        signOut(notice);
        return '';
      }
      return (err as Error).message;
    },
    [signOut]
  );

  const load = useCallback(
    async (activeToken: string) => {
      try {
        const remote = await adminApi.listEntries('post-sound', activeToken);
        authenticatedRef.current = true;
        const flat = remote.map(toFlat);
        savedFeaturedRef.current = new Map(flat.map((entry) => [entry.slug, entry.featured]));
        setEntries(flat);
      } catch (err) {
        setLoadError(handleApiError(err));
      }
    },
    [handleApiError]
  );

  useEffect(() => {
    if (token) load(token);
  }, [token, load]);

  useEffect(() => {
    if (!profileMenuOpen) return;
    function handlePointerDown(e: PointerEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setProfileMenuOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setProfileMenuOpen(false);
    }
    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [profileMenuOpen]);

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

  // Toggling here is local-only (not saved until saveChanges) so someone
  // can flip a handful of cards and save them all in one go, same as
  // reordering — rather than firing a separate write per click.
  function toggleFeatured(entry: PostSoundEntry) {
    setEntries((prev) => prev?.map((e) => (e.slug === entry.slug ? { ...e, featured: !e.featured } : e)) ?? prev);
    setDirty(true);
  }

  // Reorders live as the cursor moves, instead of only on drop — so cards
  // visibly shift into place while dragging rather than jumping once at
  // the end. Finds whichever other card's center the cursor is currently
  // closest to, and whether the cursor is past that card's own center
  // (meaning "insert after it") or before (meaning "insert before it").
  // Mirrors admin/public/app.js's getDragAfterElement, which does the same
  // thing by moving real DOM nodes instead of reordering React state.
  function reorderByPointer(draggedSlugArg: string, group: 'featured' | 'unfeatured', clientX: number, clientY: number) {
    const gridEl = (group === 'featured' ? featuredGridRef : unfeaturedGridRef).current;
    if (!entries || !gridEl) return;

    // Reordering only ever happens within the dragged card's own group —
    // featured and unfeatured live in two separate <ul>s, and the query
    // below only looks inside the one the drag started in anyway.
    const groupEntries = entries.filter((entry) => (group === 'featured' ? entry.featured : !entry.featured));
    const otherGroupEntries = entries.filter((entry) => (group === 'featured' ? !entry.featured : entry.featured));

    const others = groupEntries.filter((entry) => entry.slug !== draggedSlugArg);
    const cards = gridEl.querySelectorAll<HTMLElement>('.admin-card:not(.admin-card-dragging)');

    // Primary rule: whichever card's actual box the cursor is currently
    // inside is the target slot, full stop — this is what "drop where I'm
    // hovering" means. A half-width before/after split (the previous
    // approach) meant hovering the right half of a card targeted its
    // *neighbor* instead, which read as "always one off."
    let hitSlug: string | null = null;
    // Fallback only for when the cursor is over a gap or past the grid's
    // edge (nothing to hit-test against) — nearest card center, inserted
    // before or after depending on which side of it the cursor is on.
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
      // Below every card's row entirely — always the true end of the list,
      // not "next to whichever card happens to be nearest by raw distance"
      // (the bug: that could land you next to a last-row card based purely
      // on X, short of the actual end, which read as "jumping up").
      insertAt = others.length;
    } else if (cards.length > 0 && clientY < minTop) {
      insertAt = 0;
    } else if (closestSlug !== null) {
      const closestIndex = others.findIndex((entry) => entry.slug === closestSlug);
      insertAt = insertAfter ? closestIndex + 1 : closestIndex;
    }

    const draggedEntry = groupEntries.find((entry) => entry.slug === draggedSlugArg);
    if (!draggedEntry) return;
    const nextGroup = [...others.slice(0, insertAt), draggedEntry, ...others.slice(insertAt)];

    const unchanged = nextGroup.length === groupEntries.length && nextGroup.every((entry, i) => entry.slug === groupEntries[i].slug);
    if (unchanged) return;

    setEntries(group === 'featured' ? [...nextGroup, ...otherGroupEntries] : [...otherGroupEntries, ...nextGroup]);
    setDirty(true);
  }

  // Custom pointer-driven drag, replacing native HTML5 drag-and-drop —
  // native DnD always shows the browser's own drag-ghost snapshot (can't be
  // removed without losing the drag entirely) and never works on touch.
  // The dragged card is pulled out of the grid with position: fixed and
  // tracks the pointer 1:1 via transform; every other card keeps reflowing
  // live via reorderByPointer above. DRAG_MOVE_THRESHOLD_PX means a plain
  // click/tap (no real movement) never triggers any of this, so the edit/
  // delete buttons keep working normally.
  const DRAG_MOVE_THRESHOLD_PX = 5;

  function handleCardPointerDown(e: CardPointerEvent, entry: PostSoundEntry) {
    if (e.button !== 0) return;
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    dragRef.current = {
      slug: entry.slug,
      group: entry.featured ? 'featured' : 'unfeatured',
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
    reorderByPointer(drag.slug, drag.group, e.clientX, e.clientY);
  }

  function handleCardPointerEnd(e: CardPointerEvent) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;
    const el = e.currentTarget;
    // A pointercancel (e.g. the browser interrupting a touch drag) can
    // arrive after capture was already released — safe to ignore either way.
    try {
      el.releasePointerCapture(e.pointerId);
    } catch {
      /* already released */
    }

    if (drag.active) {
      // "Snap into place": capture where it's currently floating, drop it
      // back into normal grid flow (its already-correct final slot, thanks
      // to the live reordering above), then animate away the gap between
      // the two — a classic FLIP transition, just for this one element.
      const floatingRect = el.getBoundingClientRect();
      el.style.position = '';
      el.style.left = '';
      el.style.top = '';
      el.style.width = '';
      el.style.height = '';
      el.style.zIndex = '';
      el.style.transform = 'none';
      void el.offsetWidth; // force layout so the next read reflects the settled position
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

  // Single "Save" for both card-order dragging and the per-card featured
  // toggle below — persists the current order, then pushes an update for
  // every entry whose featured value no longer matches what's on the
  // server (per savedFeaturedRef), so a click here covers whatever's
  // actually changed instead of needing two separate save actions.
  async function saveChanges() {
    if (!entries || !token) return;
    try {
      await adminApi.reorderEntries(
        'post-sound',
        entries.map((e) => e.slug),
        token
      );

      const changedFeatured = entries.filter((entry) => savedFeaturedRef.current.get(entry.slug) !== entry.featured);
      for (const entry of changedFeatured) {
        await adminApi.updateEntry('post-sound', entry.slug, toData(entry), token);
      }

      setDirty(false);
      setStatus({
        message: changedFeatured.length > 0 ? 'Order and featured status saved.' : 'Order saved.',
      });
      await load(token);
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
        <div className="admin-signin-card">
          <h1>Admin Panel</h1>
          <p className="admin-page-subtitle">
            Please sign in to make changes if you have administrator permissions.
          </p>
          {signInNotice && <p className="admin-status admin-status-error">{signInNotice}</p>}
          {signInScriptError ? (
            <p className="admin-status admin-status-error">
              Couldn't load Google's sign-in script. Check your connection or ad blocker, then reload the page.
            </p>
          ) : (
            <div className="admin-google-btn-wrap">
              <span className="admin-google-btn-visual" aria-hidden="true">
                <GoogleGlyph />
                Sign in with Google
              </span>
              <div className="admin-google-btn-real" ref={signInButtonRef} />
            </div>
          )}
          <Link to="/" className="admin-signin-home-link">
            ← Back to home
          </Link>
        </div>
      </main>
    );
  }

  const activeSectionMeta = ADMIN_SECTIONS.find((section) => section.id === activeSection);
  const featuredEntries = entries?.filter((entry) => entry.featured) ?? [];
  const unfeaturedEntries = entries?.filter((entry) => !entry.featured) ?? [];

  function renderCard(entry: PostSoundEntry) {
    return (
      <li
        key={entry.slug}
        data-slug={entry.slug}
        className={`admin-card${draggedSlug === entry.slug ? ' admin-card-dragging' : ''}`}
        onPointerDown={(e) => handleCardPointerDown(e, entry)}
        onPointerMove={handleCardPointerMove}
        onPointerUp={handleCardPointerEnd}
        onPointerCancel={handleCardPointerEnd}
      >
        <div className="admin-card-image-wrap">
          {entry.imgPath ? (
            <img
              src={`${publicAssetUrl(entry.imgPath)}?v=${entry.updatedAt}`}
              alt=""
              loading="lazy"
              draggable={false}
            />
          ) : (
            <div className="admin-card-placeholder" />
          )}
          <div className="admin-card-overlay">
            <p className="admin-card-title">{entry.title}</p>
            <p className="admin-card-meta">{[entry.role, entry.type, entry.year].filter(Boolean).join(' · ')}</p>
          </div>
          {entry.featured && <span className="admin-card-badge">Featured</span>}
          <div className="admin-card-actions" onPointerDown={(e) => e.stopPropagation()}>
            <button
              type="button"
              className={`admin-icon-btn${entry.featured ? ' admin-icon-btn-active' : ''}`}
              onClick={() => toggleFeatured(entry)}
              aria-label={entry.featured ? 'Remove from featured' : 'Mark as featured'}
              aria-pressed={entry.featured}
              title={entry.featured ? 'Featured — shown on the public page' : 'Not featured — hidden from the public page'}
            >
              <Star size={15} fill={entry.featured ? 'currentColor' : 'none'} />
            </button>
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
    <main className="admin-page admin-shell">
      <aside className="admin-sidebar">
        <p className="admin-sidebar-title">Admin Panel</p>

        {profile && (
          <div className="admin-sidebar-profile" ref={profileMenuRef}>
            <button
              type="button"
              className="admin-sidebar-profile-trigger"
              onClick={() => setProfileMenuOpen((open) => !open)}
              aria-haspopup="true"
              aria-expanded={profileMenuOpen}
            >
              {profile.picture && !avatarError ? (
                <img
                  src={profile.picture}
                  alt=""
                  className="admin-sidebar-avatar"
                  referrerPolicy="no-referrer"
                  onError={() => setAvatarError(true)}
                />
              ) : (
                <div className="admin-sidebar-avatar admin-sidebar-avatar-fallback" aria-hidden="true">
                  {(profile.name || profile.email || '?').charAt(0).toUpperCase()}
                </div>
              )}
              <div className="admin-sidebar-profile-text">
                {profile.name && <p className="admin-sidebar-profile-name">{profile.name}</p>}
                {profile.email && <p className="admin-sidebar-profile-email">{profile.email}</p>}
              </div>
            </button>

            {profileMenuOpen && (
              <div className="admin-sidebar-profile-menu" role="menu">
                <button
                  type="button"
                  role="menuitem"
                  className="admin-sidebar-profile-menu-item"
                  onClick={() => signOut()}
                >
                  <LogOut size={15} />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        )}

        <nav className="admin-sidebar-nav" aria-label="Admin sections">
          {ADMIN_SECTIONS.map((section) => (
            <button
              key={section.id}
              type="button"
              className={`admin-sidebar-link${activeSection === section.id ? ' active' : ''}`}
              onClick={() => setActiveSection(section.id)}
              disabled={section.comingSoon}
            >
              <span>{section.label}</span>
              {section.comingSoon && <span className="admin-sidebar-badge">Soon</span>}
            </button>
          ))}
        </nav>
      </aside>

      <div className="admin-content">
        {activeSection !== 'post-sound' ? (
          <div className="admin-coming-soon">
            <h1>{activeSectionMeta?.label}</h1>
            <p className="admin-page-subtitle">Editing for this section is coming soon.</p>
          </div>
        ) : loadError ? (
          <>
            <p className="admin-status admin-status-error">{loadError}</p>
            <button type="button" className="admin-btn admin-btn-secondary" onClick={() => load(token)}>
              Retry
            </button>
          </>
        ) : entries === null ? (
          <p className="admin-loading">Loading…</p>
        ) : (
          <>
            {status && <p className={`admin-status ${status.error ? 'admin-status-error' : ''}`}>{status.message}</p>}

            <ul className="admin-grid" ref={featuredGridRef}>
              {featuredEntries.map(renderCard)}
            </ul>

            {unfeaturedEntries.length > 0 && (
              <section className="admin-unfeatured-section" aria-label="Not featured">
                <div className="admin-section-divider" aria-hidden="true" />
                <p className="admin-section-heading">
                  Not Featured <span className="admin-section-heading-hint">— hidden from the public page</span>
                </p>
                <ul className="admin-grid" ref={unfeaturedGridRef}>
                  {unfeaturedEntries.map(renderCard)}
                </ul>
              </section>
            )}

            <div className="admin-fab-group">
              {dirty && (
                <button
                  type="button"
                  className="admin-fab admin-fab-save"
                  onClick={saveChanges}
                  aria-label="Save changes"
                  title="Save changes"
                >
                  <SaveIcon size={24} />
                </button>
              )}
              <button type="button" className="admin-fab" onClick={openAdd} aria-label="Add credit">
                <Plus size={26} />
              </button>
            </div>
          </>
        )}
      </div>

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
              <input type="text" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} />
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
