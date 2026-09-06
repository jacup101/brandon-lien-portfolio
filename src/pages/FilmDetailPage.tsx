import { useEffect } from 'react';
import { Container } from 'react-bootstrap';
import { useParams, Link, useLocation } from 'react-router-dom';
import FilmDetailView from '../components/film/FilmDetailView';
import { useFilmWork } from '../hooks/useFilmWork';
import './FilmDetailPage.css';

// Routing, data-fetching, and the back link live here; the actual page
// content (hero, gallery, credits, lightboxes) is FilmDetailView, shared
// with the admin editor's live preview so both render identically.
const FilmDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const { items, error } = useFilmWork();
  const item = items?.find((f) => f.slug === slug);

  useEffect(() => {
    if (item) document.title = `${item.title} | Brandon Lien`;
  }, [item]);

  if (items === null) {
    return (
      <main>
        <Container style={{ padding: '4rem 1rem', textAlign: 'center' }}>
          <p style={{ color: 'var(--site-muted)' }}>Loading…</p>
        </Container>
      </main>
    );
  }

  if (error || !item) {
    return (
      <main>
        <Container style={{ padding: '4rem 1rem', textAlign: 'center' }}>
          <p style={{ color: 'var(--site-muted)' }}>{error ? "Couldn't load this page right now." : 'Page not found.'}</p>
          <Link to="/film" style={{ color: 'var(--site-accent)' }}>← Back to Film</Link>
        </Container>
      </main>
    );
  }

  const fromPage = (location.state as { from?: string } | null)?.from ?? '/film';
  const fromLabel = fromPage === '/film' ? 'Film' : (items.find((f) => `/film/${f.slug}` === fromPage)?.title ?? 'Back');

  return (
    <main className="film-detail-page">
      <Container className="film-detail-container">
        <Link to={fromPage} className="film-detail-back">← {fromLabel}</Link>
        <FilmDetailView item={item} filmWork={items} />
      </Container>
    </main>
  );
};

export default FilmDetailPage;
