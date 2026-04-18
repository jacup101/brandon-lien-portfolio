import { Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FILM_WORK } from '../data/filmWork';
import FilmListRow from '../components/film/FilmListRow';
import './FilmPage.css';

const CARD_SLUGS = new Set(['music-videos', 'music-session-videography', 'other-film-work']);

const FilmPage = () => {
  const rows = FILM_WORK.filter((item) => !CARD_SLUGS.has(item.slug));
  const cards = FILM_WORK.filter((item) => CARD_SLUGS.has(item.slug));

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
