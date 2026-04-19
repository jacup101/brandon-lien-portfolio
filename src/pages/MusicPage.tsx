import { Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { MUSIC_PROJECT_GROUPS } from '../data/musicProjects';
import './MusicPage.css';

function MusicPage() {
  const [featuredProjects, collaborations] = MUSIC_PROJECT_GROUPS;

  return (
    <main className="film-list-page music-page">
      <section className="film-list-section music-page-section">
        <Container>
          <section className="music-list-group" aria-label="Music projects">
            <div className="music-gallery">
              {featuredProjects.projects.map((project) => (
                project.slug === 'love-cycles' ? (
                  <Link key={project.slug} to={`/music/${project.slug}`} className="music-gallery-card music-gallery-card-link music-gallery-card-orbit">
                    <div className="music-gallery-thumb music-gallery-thumb-orbit" aria-hidden="true">
                      <div className="music-gallery-orbit">
                        <svg
                          className="music-gallery-orbit-svg"
                          viewBox="0 0 220 220"
                          role="img"
                          aria-label="Rotating In And Out of Love Cycles artwork"
                        >
                          <defs>
                            <path
                              id="love-cycles-list-circle"
                              d="M 110, 110 m -78, 0 a 78,78 0 1,1 156,0 a 78,78 0 1,1 -156,0"
                              pathLength="490"
                            />
                          </defs>
                          <text className="music-gallery-orbit-text">
                            <textPath
                              href="#love-cycles-list-circle"
                              startOffset="0%"
                              textLength="482"
                              lengthAdjust="spacingAndGlyphs"
                            >
                              {'IN AND OUT OF LOVE CYCLES IN AND OUT OF LOVE'}
                            </textPath>
                          </text>
                        </svg>
                        <div className="music-gallery-coming-soon">Coming Soon</div>
                      </div>
                    </div>
                    <div className="music-gallery-copy">
                      <h2 className="music-gallery-title">{project.title}</h2>
                    </div>
                  </Link>
                ) : (
                  <Link key={project.slug} to={`/music/${project.slug}`} className="music-gallery-card music-gallery-card-link">
                    {project.imgPath ? (
                      <div className="music-gallery-thumb">
                        <img
                          src={project.imgPath}
                          alt={project.title}
                          loading="lazy"
                          decoding="async"
                        />
                      </div>
                    ) : null}
                    <div className="music-gallery-copy">
                      <h2 className="music-gallery-title">{project.title}</h2>
                    </div>
                  </Link>
                )
              ))}
            </div>
          </section>

          <section className="music-list-group" aria-labelledby={`${collaborations.id}-heading`}>
            <div className="music-section-heading music-section-heading-secondary">
              <h2 id={`${collaborations.id}-heading`} className="music-section-title music-section-title-secondary">
                Collaborations
              </h2>
            </div>
            <div className="music-collab-grid">
              {collaborations.projects.map((project) => (
                <Link key={project.slug} to={`/music/${project.slug}`} className="music-collab-card music-collab-card-link">
                  {project.imgPath ? (
                    <div className="music-collab-thumb">
                      <img
                        src={project.imgPath}
                        alt={project.title}
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                  ) : null}
                  <div className="music-collab-copy">
                    <h3 className="music-collab-title">{project.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </Container>
      </section>
    </main>
  );
}

export default MusicPage;
