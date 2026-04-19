import { useState, useEffect } from 'react';
import './MusicPhotoCarousel.css';

interface Props {
  images: string[];
  alt?: string;
}

export default function MusicPhotoCarousel({ images, alt = '' }: Props) {
  const [index, setIndex] = useState(0);
  const [aspectRatio, setAspectRatio] = useState<string | null>(null);

  useEffect(() => {
    const img = new Image();
    img.onload = () => setAspectRatio(`${img.naturalWidth} / ${img.naturalHeight}`);
    img.src = images[0];
  }, [images[0]]);

  if (images.length === 0) return null;

  const prev = () => setIndex((i) => (i - 1 + images.length) % images.length);
  const next = () => setIndex((i) => (i + 1) % images.length);

  return (
    <div className="mpc-root">
      <div className="mpc-stage" style={aspectRatio ? { aspectRatio } : undefined}>
        <img
          key={images[index]}
          src={images[index]}
          alt={alt}
          className="mpc-img"
          loading="lazy"
          decoding="async"
        />
        {images.length > 1 && (
          <>
            <button className="mpc-btn mpc-btn--prev" onClick={prev} aria-label="Previous photo">‹</button>
            <button className="mpc-btn mpc-btn--next" onClick={next} aria-label="Next photo">›</button>
          </>
        )}
      </div>
      {images.length > 1 && (
        <div className="mpc-dots" role="tablist" aria-label="Photo navigation">
          {images.map((_, i) => (
            <button
              key={i}
              className={`mpc-dot${i === index ? ' mpc-dot--active' : ''}`}
              onClick={() => setIndex(i)}
              role="tab"
              aria-selected={i === index}
              aria-label={`Photo ${i + 1} of ${images.length}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
