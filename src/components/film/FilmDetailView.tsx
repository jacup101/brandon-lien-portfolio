import { useEffect, useRef, useState } from 'react';
import { Pencil, Plus, X } from 'lucide-react';
import { FilmItem, GalleryItem, CreditBlock } from '../../data/filmWork';
import { rawAssetKey } from '../../lib/backendApi';
import FilmListRow from './FilmListRow';
import EditableImage from '../admin/inline/EditableImage';
import EditableText from '../admin/inline/EditableText';
import GalleryItemPopover from '../admin/inline/GalleryItemPopover';
import { ChevronLeft, ChevronRight, PlayIcon } from '../util/Icons';
import '../../pages/FilmDetailPage.css';

// The actual content of a film's detail page — hero, video, gallery,
// credits, both lightboxes — extracted out of FilmDetailPage so the admin
// editor can render this exact same component in an editable state
// instead of a separate form building a preview of it. Every place that
// renders visible text or an image can be edited by clicking it directly,
// when `edit` is passed; without it (the real public page), this renders
// exactly as a visitor sees it and none of the editing code runs.
//
// The one deliberate exception is a gallery item's `type` — a video card,
// a link card, an image, and an Instagram embed are rendered by entirely
// different markup (see GalleryThumb below), so changing type can't be
// expressed as "click the text and type a new value" without the whole
// tile morphing mid-edit. That one field (plus its URL) uses a small
// anchored popover instead; everything else about a gallery item —
// label, title, role, its own image — is genuinely click-to-edit.
export interface FilmEditContext {
  token: string;
  onFieldChange: (key: string, value: unknown) => void;
}

function videoIdFromEmbed(url: string) {
  const match = url.match(/embed\/([^?]+)/);
  return match ? match[1] : '';
}

interface GalleryThumbProps {
  item: GalleryItem;
  filmWork: FilmItem[];
  currentSlug?: string;
  onExpand?: (index: number) => void;
  index?: number;
  edit?: FilmEditContext;
  onFieldChange?: (patch: Partial<GalleryItem>) => void;
  onRetype?: (anchor: { x: number; y: number }) => void;
  onRemove?: () => void;
}

function GalleryThumb({ item, filmWork, currentSlug, onExpand, index = 0, edit, onFieldChange, onRetype, onRemove }: GalleryThumbProps) {
  const editControls = edit && (
    <>
      <button
        type="button"
        className="admin-inline-remove-btn"
        style={{ right: '2.2rem' }}
        onClick={(e) => {
          e.stopPropagation();
          onRetype?.({ x: e.clientX, y: e.clientY });
        }}
        aria-label="Change type or URL"
        title="Change type or URL"
      >
        <Pencil size={12} />
      </button>
      <button
        type="button"
        className="admin-inline-remove-btn"
        onClick={(e) => {
          e.stopPropagation();
          onRemove?.();
        }}
        aria-label="Remove gallery item"
      >
        <X size={14} />
      </button>
    </>
  );

  if (item.type === 'instagram') {
    return (
      <div className="gallery-item-wrap admin-inline-item">
        {editControls}
        <div className="gallery-item gallery-item--instagram">
          <iframe src={item.url} title={item.label} allowFullScreen scrolling="no" />
        </div>
        {(item.label || item.role || edit) && (
          <div className="gallery-caption">
            {edit ? (
              <>
                <EditableText
                  className="gallery-caption-title"
                  value={item.label ?? ''}
                  placeholder="Label"
                  onChange={(v) => onFieldChange?.({ label: v })}
                />
                <EditableText
                  className="gallery-caption-role"
                  value={item.role ?? ''}
                  placeholder="Role"
                  onChange={(v) => onFieldChange?.({ role: v })}
                />
              </>
            ) : (
              <>
                {item.label && <span className="gallery-caption-title">{item.label}</span>}
                {item.role && <span className="gallery-caption-role">{item.role}</span>}
              </>
            )}
          </div>
        )}
      </div>
    );
  }

  if (item.type === 'image') {
    return (
      <div className="gallery-item gallery-item--image admin-inline-item">
        {editControls}
        {edit ? (
          <EditableImage token={edit.token} onChange={(r2Key) => onFieldChange?.({ url: r2Key })} empty={!item.url} label="Change image">
            {item.url && <img src={item.url} alt="" loading="lazy" />}
          </EditableImage>
        ) : (
          <button className="gallery-item gallery-item--thumb" onClick={() => onExpand?.(index ?? 0)} style={{ background: 'none' }}>
            <img src={item.url} alt="" loading="lazy" />
          </button>
        )}
      </div>
    );
  }

  if (item.type === 'link') {
    const isExternal = item.url.startsWith('http');

    if (!isExternal && !edit) {
      const linkedFilm = filmWork.find((f) => `/film/${f.slug}` === item.url);
      if (linkedFilm) {
        return (
          <div className="gallery-item--film-row">
            <FilmListRow item={linkedFilm} from={currentSlug ? `/film/${currentSlug}` : undefined} />
          </div>
        );
      }
    }

    return (
      <div className="gallery-item-wrap admin-inline-item">
        {editControls}
        {edit ? (
          <EditableImage token={edit.token} onChange={(r2Key) => onFieldChange?.({ imgPath: r2Key })} empty={!item.imgPath} label="Change image">
            {item.imgPath && <img src={item.imgPath} alt={item.label ?? ''} loading="lazy" />}
          </EditableImage>
        ) : item.imgPath ? (
          <a href={item.url} target="_blank" rel="noopener noreferrer" className="gallery-item--link-img-wrap">
            <div className="gallery-item gallery-item--thumb">
              <img src={item.imgPath} alt={item.label ?? ''} loading="lazy" />
              <span className="gallery-play gallery-play--link">↗</span>
            </div>
          </a>
        ) : (
          <a href={item.url} target="_blank" rel="noopener noreferrer" className="gallery-item gallery-item--link">
            <span className="gallery-link-label">{item.label}</span>
            {item.role && <span className="gallery-caption-role">{item.role}</span>}
          </a>
        )}
        {(edit || item.imgPath) && (item.label || item.role || edit) && (
          <div className="gallery-caption">
            {edit ? (
              <>
                <EditableText
                  className="gallery-caption-title"
                  value={item.label ?? ''}
                  placeholder="Label"
                  onChange={(v) => onFieldChange?.({ label: v })}
                />
                <EditableText
                  className="gallery-caption-role"
                  value={item.role ?? ''}
                  placeholder="Role"
                  onChange={(v) => onFieldChange?.({ role: v })}
                />
              </>
            ) : (
              <>
                {item.label && <span className="gallery-caption-title">{item.label}</span>}
                {item.role && <span className="gallery-caption-role">{item.role}</span>}
              </>
            )}
          </div>
        )}
      </div>
    );
  }

  const id = videoIdFromEmbed(item.url);

  return (
    <div className="gallery-item-wrap admin-inline-item">
      {editControls}
      <button className="gallery-item gallery-item--thumb" onClick={() => !edit && onExpand?.(index ?? 0)}>
        <img src={`https://img.youtube.com/vi/${id}/mqdefault.jpg`} alt="" loading="lazy" />
        <span className="gallery-play">
          <PlayIcon size={22} />
        </span>
      </button>
      {(item.title || item.role || edit) && (
        <div className="gallery-caption">
          {edit ? (
            <>
              <EditableText
                className="gallery-caption-title"
                value={item.title ?? ''}
                placeholder="Title"
                onChange={(v) => onFieldChange?.({ title: v })}
              />
              <EditableText
                className="gallery-caption-role"
                value={item.role ?? ''}
                placeholder="Role"
                onChange={(v) => onFieldChange?.({ role: v })}
              />
            </>
          ) : (
            <>
              {item.title && <span className="gallery-caption-title">{item.title}</span>}
              {item.role && <span className="gallery-caption-role">{item.role}</span>}
            </>
          )}
        </div>
      )}
    </div>
  );
}

interface FilmDetailViewProps {
  item: FilmItem;
  /** Every film, for resolving a gallery "link" item that actually points
   * at another film (rendered as that film's own list row instead). */
  filmWork: FilmItem[];
  /** Present only in the admin editor — turns every field below into a
   * click-to-edit control instead of static content. */
  edit?: FilmEditContext;
}

function FilmDetailView({ item, filmWork, edit }: FilmDetailViewProps) {
  const [posterOpen, setPosterOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [galleryPopover, setGalleryPopover] = useState<{ index: number | 'new'; anchor: { x: number; y: number } } | null>(null);
  const touchStartX = useRef<number | null>(null);

  const expandable = (item.gallery ?? [])
    .map((g, i) => ({ g, i }))
    .filter(({ g }) => g.type === 'video' || g.type === 'image');

  const expandableIndices = expandable.map(({ i }) => i);
  const lightboxPos = lightboxIndex !== null ? expandableIndices.indexOf(lightboxIndex) : -1;

  const goPrev = () => lightboxPos > 0 && setLightboxIndex(expandableIndices[lightboxPos - 1]);
  const goNext = () => lightboxPos < expandableIndices.length - 1 && setLightboxIndex(expandableIndices[lightboxPos + 1]);

  // A live preview re-renders with a new `item` on every keystroke — reset
  // whatever's open rather than risk pointing at a lightbox index that no
  // longer exists in the (possibly just-edited) gallery.
  useEffect(() => {
    setPosterOpen(false);
    setLightboxIndex(null);
  }, [item]);

  useEffect(() => {
    if (lightboxIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxIndex(null);
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'ArrowRight') goNext();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightboxIndex, lightboxPos]);

  const paragraphs = item.description ? item.description.split('\n\n') : [];

  // --- Array field helpers (edit mode only) ------------------------------
  // Images inside arrays only ever exist here as already-resolved display
  // URLs (item.laurels[i], item.gallery[i].imgPath) — rawAssetKey recovers
  // the storable key for whichever entries aren't the one actually being
  // changed, since a save always resends the whole array.
  const rawLaurels = () => (item.laurels ?? []).map(rawAssetKey);
  const rawCredits = (): CreditBlock[] => item.credits ?? [];
  const rawGallery = (): GalleryItem[] => (item.gallery ?? []).map((g) => ({ ...g, imgPath: g.imgPath ? rawAssetKey(g.imgPath) : g.imgPath }));

  function addLaurel(r2Key: string) {
    edit?.onFieldChange('laurels', [...rawLaurels(), r2Key]);
  }
  function removeLaurel(index: number) {
    edit?.onFieldChange(
      'laurels',
      rawLaurels().filter((_, i) => i !== index)
    );
  }

  function updateCredit(index: number, patch: Partial<CreditBlock>) {
    edit?.onFieldChange(
      'credits',
      rawCredits().map((c, i) => (i === index ? { ...c, ...patch } : c))
    );
  }
  function addCredit() {
    edit?.onFieldChange('credits', [...rawCredits(), { role: '', names: '' }]);
  }
  function removeCredit(index: number) {
    edit?.onFieldChange(
      'credits',
      rawCredits().filter((_, i) => i !== index)
    );
  }

  function updateGalleryItem(index: number, patch: Partial<GalleryItem>) {
    edit?.onFieldChange(
      'gallery',
      rawGallery().map((g, i) => (i === index ? { ...g, ...patch } : g))
    );
  }
  function removeGalleryItem(index: number) {
    edit?.onFieldChange(
      'gallery',
      rawGallery().filter((_, i) => i !== index)
    );
  }
  function addGalleryItem(type: GalleryItem['type'], url: string) {
    edit?.onFieldChange('gallery', [...rawGallery(), { type, url, label: '', title: '', role: '', imgPath: '' }]);
  }

  return (
    <>
      <div className="film-detail-hero">
        {(item.imgPath || edit) && (
          <div className="film-detail-poster">
            {edit ? (
              <EditableImage
                token={edit.token}
                onChange={(r2Key) => edit.onFieldChange('imgPath', r2Key)}
                empty={!item.imgPath}
                className={item.imgContain ? 'img-contain' : undefined}
              >
                {item.imgPath && <img src={item.imgPath} alt={item.title} className={item.imgContain ? 'img-contain' : ''} />}
              </EditableImage>
            ) : (
              <img
                src={item.imgPath}
                alt={item.title}
                className={`${item.imgContain ? 'img-contain' : ''} poster-clickable`}
                onClick={() => setPosterOpen(true)}
              />
            )}
            {(item.laurels || edit) && (
              <div className="film-detail-laurels">
                {(item.laurels ?? []).map((l, i) => (
                  <div key={l} className="admin-inline-item" style={{ display: 'inline-block' }}>
                    {edit && (
                      <button type="button" className="admin-inline-remove-btn" onClick={() => removeLaurel(i)} aria-label="Remove laurel">
                        <X size={12} />
                      </button>
                    )}
                    <img src={l} alt="Film festival laurel" className="film-detail-laurel" />
                  </div>
                ))}
                {edit && (
                  <EditableImage
                    token={edit.token}
                    onChange={addLaurel}
                    empty
                    label="Add laurel"
                    className="film-detail-laurel-add"
                  >
                    <Plus size={18} />
                  </EditableImage>
                )}
              </div>
            )}
          </div>
        )}
        <div className="film-detail-header">
          {edit ? (
            <EditableText className="film-detail-title" value={item.title} placeholder="Untitled" onChange={(v) => edit.onFieldChange('title', v)} />
          ) : (
            <h1 className="film-detail-title">{item.title}</h1>
          )}
          {edit ? (
            <p className="film-detail-meta">
              <EditableText sizeToContent value={item.role ?? ''} placeholder="Role" onChange={(v) => edit.onFieldChange('role', v)} />
              {' · '}
              <EditableText sizeToContent value={item.year ?? ''} placeholder="Year" onChange={(v) => edit.onFieldChange('year', v)} />
            </p>
          ) : (
            <p className="film-detail-meta">{[item.role, item.year].filter(Boolean).join(' · ')}</p>
          )}
          {edit ? (
            <EditableText
              className="film-detail-description"
              value={item.description ?? ''}
              placeholder="Description…"
              multiline
              onChange={(v) => edit.onFieldChange('description', v)}
            />
          ) : (
            paragraphs.map((p, i) => (
              <p key={i} className="film-detail-description">
                {p}
              </p>
            ))
          )}
          {!edit && item.credit && !item.credits && <p className="film-detail-description">{item.credit}</p>}
          {edit ? (
            <EditableText className="film-detail-imdb-link-input" value={item.imdbUrl ?? ''} placeholder="IMDb URL" onChange={(v) => edit.onFieldChange('imdbUrl', v)} />
          ) : (
            item.imdbUrl && (
              <a href={item.imdbUrl} target="_blank" rel="noreferrer" className="film-detail-imdb-link" aria-label="IMDb">
                <span className="film-detail-imdb-icon" aria-hidden="true" />
              </a>
            )
          )}
        </div>
      </div>

      {edit ? (
        <label className="admin-inline-plain-field">
          <span>Video embed URL</span>
          <EditableText value={item.videoUrl ?? ''} placeholder="https://www.youtube.com/embed/…" onChange={(v) => edit.onFieldChange('videoUrl', v)} />
        </label>
      ) : (
        item.videoUrl && (
          <div className="film-detail-video">
            <iframe
              src={item.videoUrl}
              title={item.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )
      )}

      {(item.heroImg || edit) && (
        <div className="film-detail-hero-img">
          {edit ? (
            <EditableImage token={edit.token} onChange={(r2Key) => edit.onFieldChange('heroImg', r2Key)} empty={!item.heroImg} label="Change banner image">
              {item.heroImg && <img src={item.heroImg} alt="" />}
            </EditableImage>
          ) : (
            <img src={item.heroImg} alt="" />
          )}
        </div>
      )}

      {(item.gallery && item.gallery.length > 0) || edit ? (
        <div
          className="film-gallery"
          style={item.galleryColumns ? ({ '--gallery-cols': item.galleryColumns } as React.CSSProperties) : undefined}
        >
          {(item.gallery ?? []).map((g, i) => (
            <GalleryThumb
              key={i}
              item={g}
              filmWork={filmWork}
              index={i}
              currentSlug={item.slug}
              onExpand={setLightboxIndex}
              edit={edit}
              onFieldChange={(patch) => updateGalleryItem(i, patch)}
              onRetype={(anchor) => setGalleryPopover({ index: i, anchor })}
              onRemove={() => removeGalleryItem(i)}
            />
          ))}
          {edit && (
            <button
              type="button"
              className="admin-inline-add-tile"
              onClick={(e) => setGalleryPopover({ index: 'new', anchor: { x: e.clientX, y: e.clientY } })}
            >
              <Plus size={20} />
              Add gallery item
            </button>
          )}
        </div>
      ) : null}

      {galleryPopover && (
        <GalleryItemPopover
          initial={
            galleryPopover.index === 'new'
              ? { type: 'video', url: '' }
              : { type: item.gallery![galleryPopover.index].type, url: item.gallery![galleryPopover.index].url }
          }
          anchor={galleryPopover.anchor}
          onClose={() => setGalleryPopover(null)}
          onSave={(value) => {
            if (galleryPopover.index === 'new') addGalleryItem(value.type, value.url);
            else updateGalleryItem(galleryPopover.index, value);
          }}
        />
      )}

      {(item.credits || edit) && (
        <div className="film-detail-credits">
          {(item.credits ?? []).map((block, i) => (
            <div key={i} className="film-detail-credit-row admin-inline-item">
              {edit && (
                <button type="button" className="admin-inline-remove-btn" onClick={() => removeCredit(i)} aria-label="Remove credit">
                  <X size={12} />
                </button>
              )}
              {edit ? (
                <>
                  <EditableText className="film-detail-credit-role" value={block.role} placeholder="Role" onChange={(v) => updateCredit(i, { role: v })} />
                  <EditableText className="film-detail-credit-names" value={block.names} placeholder="Names" onChange={(v) => updateCredit(i, { names: v })} />
                </>
              ) : (
                <>
                  <span className="film-detail-credit-role">{block.role}</span>
                  <span className="film-detail-credit-names">{block.names}</span>
                </>
              )}
            </div>
          ))}
          {edit && (
            <button type="button" className="admin-btn admin-btn-secondary" onClick={addCredit} style={{ marginTop: '0.5rem' }}>
              + Add credit
            </button>
          )}
          {!edit && item.credit && <div className="film-detail-credit-footer-line">{item.credit.split('\n').join(' · ')}</div>}
          {edit && (
            <label className="admin-inline-plain-field" style={{ marginTop: '0.75rem' }}>
              <span>Credit footer line</span>
              <EditableText value={item.credit ?? ''} placeholder="Credit line…" multiline onChange={(v) => edit.onFieldChange('credit', v)} />
            </label>
          )}
        </div>
      )}

      {posterOpen && item.imgPath && (
        <div className="poster-lightbox" onClick={() => setPosterOpen(false)}>
          <img src={item.imgPath} alt={item.title} />
        </div>
      )}

      {lightboxIndex !== null &&
        item.gallery &&
        (() => {
          const current = item.gallery![lightboxIndex];
          const hasPrev = lightboxPos > 0;
          const hasNext = lightboxPos < expandableIndices.length - 1;
          return (
            <div
              className="video-lightbox"
              onClick={() => setLightboxIndex(null)}
              onTouchStart={(e) => {
                touchStartX.current = e.touches[0].clientX;
              }}
              onTouchEnd={(e) => {
                if (touchStartX.current === null) return;
                const dx = e.changedTouches[0].clientX - touchStartX.current;
                if (dx > 50 && hasPrev) goPrev();
                else if (dx < -50 && hasNext) goNext();
                touchStartX.current = null;
              }}
            >
              <div className="video-lightbox-inner" onClick={(e) => e.stopPropagation()}>
                <button className="video-lightbox-close" onClick={() => setLightboxIndex(null)} aria-label="Close">
                  ✕
                </button>
                <div className="lightbox-content-wrap">
                  {hasPrev && (
                    <button className="lightbox-nav lightbox-nav--prev" onClick={goPrev} aria-label="Previous">
                      <ChevronLeft size={28} />
                    </button>
                  )}
                  {hasNext && (
                    <button className="lightbox-nav lightbox-nav--next" onClick={goNext} aria-label="Next">
                      <ChevronRight size={28} />
                    </button>
                  )}
                  {current.type === 'video' ? (
                    <div className="video-lightbox-frame">
                      <iframe
                        key={current.url}
                        src={`${current.url}?autoplay=1`}
                        title="Video"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  ) : (
                    <div className="lightbox-image-wrap">
                      <img key={current.url} src={current.url} alt="" className="lightbox-image" />
                    </div>
                  )}
                </div>
                {(current.title || current.label || current.role) && (
                  <div className="lightbox-caption">
                    {(current.title || current.label) && <span className="lightbox-caption-title">{current.title ?? current.label}</span>}
                    {current.role && <span className="lightbox-caption-role">{current.role}</span>}
                  </div>
                )}
                {expandableIndices.length > 1 && (
                  <div className="lightbox-mobile-controls">
                    <button className="lightbox-mobile-btn" onClick={goPrev} disabled={!hasPrev} aria-label="Previous">
                      <ChevronLeft size={24} />
                    </button>
                    <span className="lightbox-mobile-count">
                      {lightboxPos + 1} / {expandableIndices.length}
                    </span>
                    <button className="lightbox-mobile-btn" onClick={goNext} disabled={!hasNext} aria-label="Next">
                      <ChevronRight size={24} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })()}
    </>
  );
}

export default FilmDetailView;
