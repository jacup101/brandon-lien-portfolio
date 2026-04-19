import { Container } from 'react-bootstrap';
import { Link, useParams } from 'react-router-dom';
import { MUSIC_PROJECT_GROUPS } from '../data/musicProjects';
import './MusicDetailPage.css';

const MUSIC_PROJECTS = MUSIC_PROJECT_GROUPS.flatMap((group) => group.projects);

function MusicDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const project = MUSIC_PROJECTS.find((item) => item.slug === slug);

  if (!project) {
    return (
      <main>
        <Container style={{ padding: '4rem 1rem', textAlign: 'center' }}>
          <p style={{ color: 'var(--site-muted)' }}>Page not found.</p>
          <Link to="/music" style={{ color: 'var(--site-accent)' }}>← Back to Music</Link>
        </Container>
      </main>
    );
  }

  const paragraphs = (project.detailDescription ?? project.description).split('\n\n');
  const pdfHref = project.pdfUrl ? encodeURI(project.pdfUrl) : undefined;

  return (
    <main className="film-detail-page music-detail-page">
      <Container className="film-detail-container music-detail-container">
        <Link to="/music" className="film-detail-back">← Music</Link>

        {project.slug === 'love-cycles' ? (
          <section className="music-detail-solo" aria-label="Love Cycles coming soon artwork">
            <div className="music-detail-orbit-wrap" aria-hidden="true">
              <div className="music-detail-orbit">
                <svg
                  className="music-detail-orbit-svg"
                  viewBox="0 0 420 420"
                  role="img"
                  aria-label="Rotating In And Out of Love Cycles artwork"
                >
                  <defs>
                    <path
                      id="love-cycles-detail-circle"
                      d="M 210, 210 m -152, 0 a 152,152 0 1,1 304,0 a 152,152 0 1,1 -304,0"
                      pathLength="955"
                    />
                  </defs>
                  <text className="music-detail-orbit-text">
                    <textPath
                      href="#love-cycles-detail-circle"
                      startOffset="0%"
                      textLength="944"
                      lengthAdjust="spacingAndGlyphs"
                    >
                      {'IN AND OUT OF LOVE CYCLES IN AND OUT OF LOVE'}
                    </textPath>
                  </text>
                </svg>
                <div className="music-detail-coming-soon">Coming Soon</div>
              </div>
            </div>
          </section>
        ) : (
          <>
            <div className="film-detail-hero music-detail-hero">
              {project.imgPath ? (
                <div className="music-detail-art">
                  <img
                    src={project.imgPath}
                    alt={project.title}
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              ) : null}
              <div className="film-detail-header">
                <h1 className="film-detail-title">{project.title}</h1>
                <p className="film-detail-meta">
                  {[project.role, project.year].filter(Boolean).join(' · ') || 'Music'}
                </p>
                {paragraphs.map((paragraph) => (
                  <p key={paragraph} className="film-detail-description">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>

            {project.spotifyEmbedUrl || project.appleMusicEmbedUrl || project.tidalEmbedUrl || project.soundcloudEmbedUrl || project.bandcampEmbedUrl ? (
              <section className="music-detail-media-section" aria-labelledby="music-listen-heading">
                <h2 id="music-listen-heading" className="music-detail-section-title">Listen</h2>
                <div className="music-detail-embed-grid">
                  <div className="music-detail-embed-stack">
                    {project.spotifyEmbedUrl ? (
                      <div className="music-detail-audio-embed music-detail-audio-embed-spotify">
                        <iframe
                          src={project.spotifyEmbedUrl}
                          title={`${project.title} Spotify embed`}
                          loading="lazy"
                          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                        />
                      </div>
                    ) : null}

                    {project.appleMusicEmbedUrl ? (
                      <div className="music-detail-audio-embed music-detail-audio-embed-apple">
                        <iframe
                          src={project.appleMusicEmbedUrl}
                          title={`${project.title} Apple Music embed`}
                          loading="lazy"
                          allow="autoplay *; encrypted-media *; fullscreen *; clipboard-write"
                          sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-top-navigation-by-user-activation"
                        />
                      </div>
                    ) : null}

                    {project.tidalEmbedUrl ? (
                      <div className="music-detail-audio-embed music-detail-audio-embed-tidal">
                        <iframe
                          src={project.tidalEmbedUrl}
                          title={`${project.title} Tidal embed`}
                          loading="lazy"
                          allow="encrypted-media; fullscreen; clipboard-write https://embed.tidal.com; web-share"
                          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
                        />
                      </div>
                    ) : null}

                    {project.soundcloudEmbedUrl ? (
                      <div className="music-detail-audio-embed music-detail-audio-embed-soundcloud">
                        <iframe
                          src={project.soundcloudEmbedUrl}
                          title={`${project.title} SoundCloud embed`}
                          loading="lazy"
                          allow="autoplay"
                          scrolling="no"
                        />
                      </div>
                    ) : null}
                  </div>

                  {project.bandcampEmbedUrl ? (
                    <iframe
                      className="music-detail-bandcamp-embed"
                      style={{ border: 0, width: '100%', height: `${project.bandcampEmbedHeight ?? 472}px` }}
                      src={project.bandcampEmbedUrl}
                      title={`${project.title} Bandcamp embed`}
                      seamless
                    />
                  ) : null}
                </div>
              </section>
            ) : null}

            {project.videoUrl ? (
              <section className="music-detail-media-section" aria-labelledby="music-video-heading">
                <h2 id="music-video-heading" className="music-detail-section-title">Video</h2>
                <div className="music-detail-video">
                  <iframe
                    src={project.videoUrl}
                    title={`${project.title} video`}
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                </div>
              </section>
            ) : null}

            {project.bannerImages?.length ? (
              <section className={`music-detail-banner${project.bannerLayout === 'vertical' ? ' music-detail-banner--vertical' : ''}`} aria-label={`${project.title} photo banner`}>
                {project.bannerImages.map((imagePath) => (
                  <div key={imagePath} className="music-detail-banner-item">
                    <img src={imagePath} alt="" loading="lazy" decoding="async" />
                  </div>
                ))}
              </section>
            ) : null}

            {project.pdfUrl ? (
              <section className="music-detail-media-section" aria-labelledby="music-links-heading">
                <div className="music-detail-section-head">
                  <h2 id="music-links-heading" className="music-detail-section-title">Links</h2>
                </div>
                <div className="music-detail-link-list">
                  {project.links?.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      target="_blank"
                      rel="noreferrer"
                      className="music-detail-link-item"
                    >
                      {link.label} →
                    </a>
                  ))}
                  <a
                    href={pdfHref}
                    target="_blank"
                    rel="noreferrer"
                    className="music-detail-link-item"
                  >
                    Brandon Lien – REMINISCENCES – Liner Notes →
                  </a>
                </div>
              </section>
            ) : project.links?.length ? (
              <section className="music-detail-media-section" aria-labelledby="music-links-heading">
                <div className="music-detail-section-head">
                  <h2 id="music-links-heading" className="music-detail-section-title">Links</h2>
                </div>
                <div className="music-detail-link-list">
                  {project.links.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      target="_blank"
                      rel="noreferrer"
                      className="music-detail-link-item"
                    >
                      {link.label} →
                    </a>
                  ))}
                </div>
              </section>
            ) : null}
          </>
        )}
      </Container>
    </main>
  );
}

export default MusicDetailPage;
