import { useEffect } from 'react';
import { Container } from 'react-bootstrap';
import { Link, useParams } from 'react-router-dom';
import MusicDetailView from '../components/music/MusicDetailView';
import { useMusicWork } from '../hooks/useMusicWork';
import './MusicDetailPage.css';

// Routing, data-fetching, and the back link live here; the actual page
// content is MusicDetailView, shared with the admin editor's live preview
// so both render identically (same split as Film's detail page).
function MusicDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { items, error } = useMusicWork();
  const project = items?.find((item) => item.slug === slug);

  useEffect(() => {
    if (project) document.title = `${project.title} | Brandon Lien`;
  }, [project]);

  if (items === null) {
    return (
      <main>
        <Container style={{ padding: '4rem 1rem', textAlign: 'center' }}>
          <p style={{ color: 'var(--site-muted)' }}>Loading…</p>
        </Container>
      </main>
    );
  }

  if (error || !project) {
    return (
      <main>
        <Container style={{ padding: '4rem 1rem', textAlign: 'center' }}>
          <p style={{ color: 'var(--site-muted)' }}>{error ? "Couldn't load this page right now." : 'Page not found.'}</p>
          <Link to="/music" style={{ color: 'var(--site-accent)' }}>← Back to Music</Link>
        </Container>
      </main>
    );
  }

  return (
    <main className="film-detail-page music-detail-page">
      <Container className="film-detail-container music-detail-container">
        <Link to="/music" className="film-detail-back">← Music</Link>
        <MusicDetailView project={project} />
      </Container>
    </main>
  );
}

export default MusicDetailPage;
