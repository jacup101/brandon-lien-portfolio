import { useRef, useState } from 'react';
import { ImagePlus } from 'lucide-react';
import * as adminApi from '../../../lib/adminApi';
import { compressImage } from '../../../lib/compressImage';
import './EditableInline.css';

// Wraps whatever image markup is passed as children with a hover overlay
// ("click to change image") — the click target is the image itself, same
// as EditableText makes the rendered title itself the click target.
// `onChange` receives the new R2 key once the upload finishes; the caller
// is responsible for re-rendering with the new resolved URL (same as
// every other field here — this component doesn't know about
// publicAssetUrl or the surrounding item shape).
interface EditableImageProps {
  onChange: (r2Key: string) => void;
  token: string;
  children: React.ReactNode;
  className?: string;
  /** Shown instead of children when there's no image yet. */
  empty?: boolean;
  label?: string;
}

function EditableImage({ onChange, token, children, className = '', empty = false, label }: EditableImageProps) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const overlayText = label ?? (empty ? 'Add image' : 'Change image');

  async function handleFile(file: File | null) {
    if (!file) return;
    setUploading(true);
    try {
      const compressed = await compressImage(file);
      const asset = await adminApi.uploadAsset(compressed, file.name, token);
      onChange(asset.r2Key);
    } catch {
      // Silently ignored here — this is a UI convenience layer; a real
      // failure still shows up when Save actually tries to persist the
      // entry (the field just stays whatever it was before the attempt).
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className={`admin-inline-image ${empty ? 'admin-inline-image-empty' : ''} ${className}`} onClick={() => inputRef.current?.click()}>
      {children}
      <div className="admin-inline-image-overlay">
        {uploading ? <span>Uploading…</span> : (
          <>
            <ImagePlus size={empty ? 22 : 18} />
            <span>{overlayText}</span>
          </>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="admin-inline-image-input"
        onClick={(e) => e.stopPropagation()}
        onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
      />
    </div>
  );
}

export default EditableImage;
