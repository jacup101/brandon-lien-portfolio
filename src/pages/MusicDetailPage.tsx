import { useEffect } from 'react';
import { Container } from 'react-bootstrap';
import { Link, useParams } from 'react-router-dom';
import { MUSIC_PROJECT_GROUPS } from '../data/musicProjects';
import MusicPhotoCarousel from '../components/music/MusicPhotoCarousel';
import './MusicDetailPage.css';

const MUSIC_PROJECTS = MUSIC_PROJECT_GROUPS.flatMap((group) => group.projects);

function MusicDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const project = MUSIC_PROJECTS.find((item) => item.slug === slug);

  useEffect(() => {
    if (project) document.title = `${project.title} | Brandon Lien`;
  }, [project]);

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

  const rawText = project.detailDescription ?? project.description;
  const paragraphs = project.albumName
    ? rawText.split('\n\n').map((p) => p.replace(project.albumName!, `<em>${project.albumName}</em>`))
    : rawText.split('\n\n');
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
                <p className="film-detail-meta">
                  {[project.role, project.year].filter(Boolean).join(' · ') || 'Music'}
                </p>
                {paragraphs.map((paragraph) => (
                  <p key={paragraph} className="film-detail-description" dangerouslySetInnerHTML={{ __html: paragraph }} />
                ))}
              </div>
            </div>

            {project.spotifyEmbedUrl || project.appleMusicEmbedUrl || project.tidalEmbedUrl || project.soundcloudEmbedUrl || project.bandcampEmbedUrl ? (
              <section className="music-detail-media-section">
                <div className={`music-detail-embed-grid${project.embedLayout === 'side-by-side' ? ' music-detail-embed-grid--side-by-side' : ''}`}>
                  {project.embedLayout === 'side-by-side' ? (
                    <>
                      {project.spotifyEmbedUrl ? (
                        <div className="music-detail-audio-embed music-detail-audio-embed-spotify">
                          <iframe src={project.spotifyEmbedUrl} title={`${project.title} Spotify embed`} loading="lazy" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" />
                        </div>
                      ) : null}
                      {project.appleMusicEmbedUrl ? (
                        <div className="music-detail-audio-embed music-detail-audio-embed-apple">
                          <iframe src={project.appleMusicEmbedUrl} title={`${project.title} Apple Music embed`} loading="lazy" allow="autoplay *; encrypted-media *; fullscreen *; clipboard-write" sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-top-navigation-by-user-activation" />
                        </div>
                      ) : null}
                      {project.tidalEmbedUrl ? (
                        <div className="music-detail-audio-embed music-detail-audio-embed-tidal">
                          <iframe src={project.tidalEmbedUrl} title={`${project.title} Tidal embed`} loading="lazy" allow="encrypted-media; fullscreen; clipboard-write https://embed.tidal.com; web-share" sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox" />
                        </div>
                      ) : null}
                      {project.soundcloudEmbedUrl ? (
                        <div className="music-detail-audio-embed music-detail-audio-embed-soundcloud">
                          <iframe src={project.soundcloudEmbedUrl} title={`${project.title} SoundCloud embed`} loading="lazy" allow="autoplay" scrolling="no" />
                        </div>
                      ) : null}
                    </>
                  ) : (
                    <div className="music-detail-embed-stack">
                      {project.spotifyEmbedUrl ? (
                        <div className="music-detail-audio-embed music-detail-audio-embed-spotify">
                          <iframe src={project.spotifyEmbedUrl} title={`${project.title} Spotify embed`} loading="lazy" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" />
                        </div>
                      ) : null}
                      {project.appleMusicEmbedUrl ? (
                        <div className="music-detail-audio-embed music-detail-audio-embed-apple">
                          <iframe src={project.appleMusicEmbedUrl} title={`${project.title} Apple Music embed`} loading="lazy" allow="autoplay *; encrypted-media *; fullscreen *; clipboard-write" sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-top-navigation-by-user-activation" />
                        </div>
                      ) : null}
                      {project.tidalEmbedUrl ? (
                        <div className="music-detail-audio-embed music-detail-audio-embed-tidal">
                          <iframe src={project.tidalEmbedUrl} title={`${project.title} Tidal embed`} loading="lazy" allow="encrypted-media; fullscreen; clipboard-write https://embed.tidal.com; web-share" sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox" />
                        </div>
                      ) : null}
                      {project.soundcloudEmbedUrl ? (
                        <div className="music-detail-audio-embed music-detail-audio-embed-soundcloud">
                          <iframe src={project.soundcloudEmbedUrl} title={`${project.title} SoundCloud embed`} loading="lazy" allow="autoplay" scrolling="no" />
                        </div>
                      ) : null}
                    </div>
                  )}

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
              <section className="music-detail-media-section">
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

            {project.extraVideoUrls?.map((url) => (
              <section key={url} className="music-detail-media-section">
                <div className="music-detail-video">
                  <iframe
                    src={url}
                    title={`${project.title} video`}
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                </div>
              </section>
            ))}

            {project.carouselImages?.length ? (
              <MusicPhotoCarousel images={project.carouselImages} alt={project.title} />
            ) : project.bannerImages?.length ? (
              <section className={`music-detail-banner${project.bannerLayout === 'vertical' ? ' music-detail-banner--vertical' : ''}`} aria-label={`${project.title} photo banner`}>
                {project.bannerImages.map((imagePath) => (
                  <div key={imagePath} className="music-detail-banner-item">
                    <img src={imagePath} alt="" loading="lazy" decoding="async" />
                  </div>
                ))}
              </section>
            ) : null}

            {project.pdfUrl ? (
              <section className="music-detail-media-section">
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
                    Brandon Lien – REMINISCENCES – Liner Notes (PDF) →
                  </a>
                </div>
              </section>
            ) : project.links?.length ? (
              <section className="music-detail-media-section">
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
