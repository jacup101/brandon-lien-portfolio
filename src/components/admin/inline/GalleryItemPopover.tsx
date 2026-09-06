import { useState } from 'react';
import type { GalleryItem } from '../../../data/filmWork';

// The one place Film's inline editor falls back to a small form instead
// of pure click-to-edit-text: a gallery item's `type` decides which of
// four completely different things gets rendered (see FilmDetailView's
// GalleryThumb), so "type" and "url" are edited together here rather than
// as a text field that would need to visually morph the whole tile as you
// type. Everything else about a gallery item (label/title/role/image)
// stays genuinely inline once it exists.
const TYPE_OPTIONS: { value: GalleryItem['type']; label: string }[] = [
  { value: 'video', label: 'Video (YouTube embed URL)' },
  { value: 'link', label: 'Link' },
  { value: 'image', label: 'Image' },
  { value: 'instagram', label: 'Instagram embed' },
];

interface GalleryItemPopoverProps {
  initial: { type: GalleryItem['type']; url: string };
  anchor: { x: number; y: number };
  onSave: (value: { type: GalleryItem['type']; url: string }) => void;
  onClose: () => void;
}

function GalleryItemPopover({ initial, anchor, onSave, onClose }: GalleryItemPopoverProps) {
  const [type, setType] = useState<GalleryItem['type']>(initial.type);
  const [url, setUrl] = useState(initial.url);

  return (
    <>
      <div className="admin-inline-popover-backdrop" onClick={onClose} />
      <div className="admin-inline-popover" style={{ top: anchor.y, left: anchor.x }}>
        <label>
          Type
          <select value={type} onChange={(e) => setType(e.target.value as GalleryItem['type'])}>
            {TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          URL
          <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} autoFocus />
        </label>
        <div className="admin-inline-popover-actions">
          <button type="button" className="admin-btn admin-btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="admin-btn admin-btn-primary"
            onClick={() => {
              onSave({ type, url });
              onClose();
            }}
          >
            Save
          </button>
        </div>
      </div>
    </>
  );
}

export default GalleryItemPopover;
