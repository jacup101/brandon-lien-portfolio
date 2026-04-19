import { useState, useEffect } from 'react';
import { Container } from 'react-bootstrap';
import { useParams, Link, useLocation } from 'react-router-dom';
import { FILM_WORK, GalleryItem } from '../data/filmWork';
import FilmListRow from '../components/film/FilmListRow';
import './FilmDetailPage.css';

function videoIdFromEmbed(url: string) {
  const match = url.match(/embed\/([^?]+)/);
  return match ? match[1] : '';
}

function GalleryThumb({ item, currentSlug, onExpand }: { item: GalleryItem; currentSlug?: string; onExpand?: (url: string) => void }) {
  if (item.type === 'instagram') {
    return (
      <div className="gallery-item-wrap">
        <div className="gallery-item gallery-item--instagram">
          <iframe
            src={item.url}
            title={item.label}
            allowFullScreen
            scrolling="no"
          />
        </div>
        {(item.label || item.role) && (
          <div className="gallery-caption">
            {item.label && <span className="gallery-caption-title">{item.label}</span>}
            {item.role && <span className="gallery-caption-role">{item.role}</span>}
          </div>
        )}
      </div>
    );
  }

  if (item.type === 'image') {
    return (
      <div className="gallery-item gallery-item--image">
        <img src={item.url} alt="" loading="lazy" />
      </div>
    );
  }

  if (item.type === 'link') {
    const isExternal = item.url.startsWith('http');

    if (!isExternal) {
      const linkedFilm = FILM_WORK.find((f) => `/film/${f.slug}` === item.url);
      if (linkedFilm) {
        return (
          <div className="gallery-item--film-row">
            <FilmListRow item={linkedFilm} from={currentSlug ? `/film/${currentSlug}` : undefined} />
          </div>
        );
      }
    }

    if (item.imgPath) {
      return (
        <div className="gallery-item-wrap">
          <a href={item.url} target="_blank" rel="noopener noreferrer" className="gallery-item--link-img-wrap">
            <div className="gallery-item gallery-item--thumb">
              <img src={item.imgPath} alt={item.label ?? ''} loading="lazy" />
              <span className="gallery-play gallery-play--link">↗</span>
            </div>
          </a>
          {(item.label || item.role) && (
            <div className="gallery-caption">
              {item.label && <span className="gallery-caption-title">{item.label}</span>}
              {item.role && <span className="gallery-caption-role">{item.role}</span>}
            </div>
          )}
        </div>
      );
    }

    return (
      <a href={item.url} target="_blank" rel="noopener noreferrer" className="gallery-item gallery-item--link">
        <span className="gallery-link-label">{item.label}</span>
        {item.role && <span className="gallery-caption-role">{item.role}</span>}
      </a>
    );
  }

  const id = videoIdFromEmbed(item.url);

  return (
    <div className="gallery-item-wrap">
      <button className="gallery-item gallery-item--thumb" onClick={() => onExpand?.(item.url)}>
        <img
          src={`https://img.youtube.com/vi/${id}/mqdefault.jpg`}
          alt=""
          loading="lazy"
        />
        <span className="gallery-play">▶</span>
      </button>
      {(item.title || item.role) && (
        <div className="gallery-caption">
          {item.title && <span className="gallery-caption-title">{item.title}</span>}
          {item.role && <span className="gallery-caption-role">{item.role}</span>}
        </div>
      )}
    </div>
  );
}

const FilmDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const item = FILM_WORK.find((f) => f.slug === slug);

  if (!item) {
    return (
      <main>
        <Container style={{ padding: '4rem 1rem', textAlign: 'center' }}>
          <p style={{ color: 'var(--site-muted)' }}>Page not found.</p>
          <Link to="/film" style={{ color: 'var(--site-accent)' }}>← Back to Film</Link>
        </Container>
      </main>
    );
  }

  const paragraphs = item.description ? item.description.split('\n\n') : [];
  const [posterOpen, setPosterOpen] = useState(false);
  const [lightboxVideo, setLightboxVideo] = useState<string | null>(null);

  useEffect(() => {
    if (!lightboxVideo) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setLightboxVideo(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightboxVideo]);

  const fromPage = (location.state as { from?: string } | null)?.from ?? '/film';
  const fromLabel = fromPage === '/film' ? 'Film' : (FILM_WORK.find(f => `/film/${f.slug}` === fromPage)?.title ?? 'Back');

  return (
    <main className="film-detail-page">
      <Container className="film-detail-container">
        <Link to={fromPage} className="film-detail-back">← {fromLabel}</Link>

        <div className="film-detail-hero">
          {item.imgPath && (
            <div className="film-detail-poster">
              <img
                src={item.imgPath}
                alt={item.title}
                className={`${item.imgContain ? 'img-contain' : ''} poster-clickable`}
                onClick={() => setPosterOpen(true)}
              />
              {item.laurels && (
                <div className="film-detail-laurels">
                  {item.laurels.map((l) => (
                    <img key={l} src={l} alt="Film festival laurel" className="film-detail-laurel" />
                  ))}
                </div>
              )}
            </div>
          )}
          <div className="film-detail-header">
            <h1 className="film-detail-title">{item.title}</h1>
            <p className="film-detail-meta">
              {[item.role, item.year].filter(Boolean).join(' · ')}
            </p>
            {paragraphs.map((p, i) => (
              <p key={i} className="film-detail-description">{p}</p>
            ))}
            {item.credit && !item.credits && (
              <p className="film-detail-description">{item.credit}</p>
            )}
          </div>
        </div>

        {item.videoUrl && (
          <div className="film-detail-video">
            <iframe
              src={item.videoUrl}
              title={item.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}

        {item.heroImg && (
          <div className="film-detail-hero-img">
            <img src={item.heroImg} alt="" />
          </div>
        )}

        {item.gallery && item.gallery.length > 0 && (
          <div
            className="film-gallery"
            style={item.galleryColumns ? { gridTemplateColumns: `repeat(${item.galleryColumns}, 1fr)` } : undefined}
          >
            {item.gallery.map((g, i) => (
              <GalleryThumb key={i} item={g} currentSlug={slug} onExpand={setLightboxVideo} />
            ))}
          </div>
        )}

        {item.credits && (
          <div className="film-detail-credits">
            {item.credits && item.credits.map((block) => (
              <div key={block.role} className="film-detail-credit-row">
                <span className="film-detail-credit-role">{block.role}</span>
                <span className="film-detail-credit-names">{block.names}</span>
              </div>
            ))}
            {item.credit && (
              <div className="film-detail-credit-footer-line">
                {item.credit.split('\n').join(' · ')}
              </div>
            )}
          </div>
        )}
      </Container>

      {posterOpen && item.imgPath && (
        <div className="poster-lightbox" onClick={() => setPosterOpen(false)}>
          <img src={item.imgPath} alt={item.title} />
        </div>
      )}

      {lightboxVideo && (
        <div className="video-lightbox" onClick={() => setLightboxVideo(null)}>
          <div className="video-lightbox-inner" onClick={(e) => e.stopPropagation()}>
            <button className="video-lightbox-close" onClick={() => setLightboxVideo(null)} aria-label="Close video">✕</button>
            <div className="video-lightbox-frame">
              <iframe
                src={`${lightboxVideo}?autoplay=1`}
                title="Video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default FilmDetailPage;
