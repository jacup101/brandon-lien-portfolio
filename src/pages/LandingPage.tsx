import { useEffect, useState } from 'react';
import { Container, Spinner } from 'react-bootstrap';
import type { FilmData } from '../types/FilmData';
import './LandingPage.css';

const filmNames = ['shades_of_trish', 'el_malcriado'];

function LandingPage() {
  const [films, setFilms] = useState<FilmData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFilms = async () => {
      const loadedFilms = await Promise.all(
        filmNames.map(async (filmName) => {
          const module = await import(`../data/film/${filmName}.json`);
          return module.default as FilmData;
        })
      );

      const sortedFilms = [...loadedFilms].sort(
        (left, right) => Number(right.year) - Number(left.year)
      );

      setFilms(sortedFilms);
      setLoading(false);
    };

    loadFilms();
  }, []);

  return (
    <main className="landing-page">
      <section className="landing-section">
        <Container>
          {loading ? (
            <div className="landing-inline-loading">
              <Spinner animation="border" role="status" />
            </div>
          ) : (
            <div className="landing-gallery">
              {films.map((film) => (
                <article key={film.title} className="landing-gallery-card">
                  <div className="landing-gallery-image-wrap">
                    <img
                      src={film.imgPath}
                      alt={film.title}
                      className="landing-gallery-image"
                    />
                    <div className="landing-gallery-overlay">
                      <p className="landing-gallery-title">{film.title}</p>
                      <p className="landing-gallery-year">{film.year}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          <section className="landing-reel-section" aria-labelledby="film-reel-heading">
            <div className="landing-reel-header">
              <p className="landing-reel-kicker">Film Reel</p>
              <h2 id="film-reel-heading" className="landing-reel-title">Selected reel</h2>
            </div>

            <div className="landing-reel-frame">
              <iframe
                className="landing-reel-embed"
                src="https://www.youtube.com/embed/oaXRREHVkHo"
                title="Mock film reel"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            </div>
          </section>
        </Container>
      </section>
    </main>
  );
}

export default LandingPage;
