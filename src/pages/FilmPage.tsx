import { Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import FilmListRow from '../components/film/FilmListRow';
import { useFilmWork } from '../hooks/useFilmWork';
import './FilmPage.css';

const CARD_SLUGS = new Set(['music-videos', 'music-session-videography', 'other-film-work']);

const FilmPage = () => {
  const { items, error } = useFilmWork();

  if (items === null) {
    return (
      <main className="film-list-page">
        <Container style={{ padding: '4rem 1rem', textAlign: 'center' }}>
          <p style={{ color: 'var(--site-muted)' }}>Loading…</p>
        </Container>
      </main>
    );
  }

  if (error) {
    return (
      <main className="film-list-page">
        <Container style={{ padding: '4rem 1rem', textAlign: 'center' }}>
          <p style={{ color: 'var(--site-muted)' }}>Couldn&apos;t load this page right now.</p>
        </Container>
      </main>
    );
  }

  const rows = items.filter((item) => !CARD_SLUGS.has(item.slug));
  const cards = items.filter((item) => CARD_SLUGS.has(item.slug));

  return (
    <main className="film-list-page">
      <section className="film-list-section">
        <Container>
          <div className="film-list">
            {rows.map((item) => (
              <FilmListRow key={item.slug} item={item} />
            ))}
          </div>
          <div className="film-card-grid">
            {cards.map((item) => (
              <Link
                key={item.slug}
                to={`/film/${item.slug}`}
                className="film-card"
              >
                <h2 className="film-card-title">{item.title}</h2>
              </Link>
            ))}
          </div>
        </Container>
      </section>
    </main>
  );
};

export default FilmPage;
