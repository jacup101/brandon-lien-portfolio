import { useEffect, useRef } from 'react';
import './EditableInline.css';

// Renders as a plain <input>/<textarea> styled to be visually
// indistinguishable from static text (transparent background, no border,
// inherits font/size/color from whatever className is passed) until
// hovered or focused, when a subtle underline/highlight signals it's
// editable. This is what makes "editing in place" mean literally that —
// you click the actual rendered title and type, instead of a form field
// somewhere else updating a preview of the title.
interface EditableTextProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
  multiline?: boolean;
  /** For short fields meant to sit inline with surrounding text (e.g.
   * "ROLE · YEAR") — sizes the input to its own content via the native
   * `size` attribute instead of stretching to fill its container or
   * clipping at a fixed width. */
  sizeToContent?: boolean;
}

function EditableText({ value, onChange, className = '', placeholder, multiline = false, sizeToContent = false }: EditableTextProps) {
  const ref = useRef<HTMLTextAreaElement>(null);

  const autoResize = () => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  };

  useEffect(() => {
    if (multiline) autoResize();
  }, [value, multiline]);

  if (multiline) {
    return (
      <textarea
        ref={ref}
        className={`admin-inline-editable admin-inline-editable-multiline ${className}`}
        value={value}
        placeholder={placeholder}
        rows={1}
        onChange={(e) => {
          onChange(e.target.value);
          autoResize();
        }}
      />
    );
  }

  return (
    <input
      type="text"
      className={`admin-inline-editable ${sizeToContent ? 'admin-inline-editable-sized' : ''} ${className}`}
      value={value}
      placeholder={placeholder}
      // +4, not +1: `size` estimates width from a bare character, but
      // fields using this (e.g. FilmDetailView's uppercase, letter-spaced
      // meta line) often have extra letter-spacing that a naive
      // char-count doesn't account for — pad enough to avoid clipping.
      size={sizeToContent ? Math.max(value.length, placeholder?.length ?? 0, 3) + 4 : undefined}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

export default EditableText;
