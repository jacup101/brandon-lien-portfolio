import { useState } from 'react';
import { Container } from 'react-bootstrap';
import PostProductionGallery from '../components/postProduction/PostProductionGallery';

const FilmsPage = () => {
  const [reelLoaded, setReelLoaded] = useState(false);
  const [reelError, setReelError] = useState(false);

  return (
    <main className="landing-page">
      <section className="landing-section">
        <Container>
          <div className="pp-page-header">
            <div className="pp-page-nav" role="navigation" aria-label="Post-production sections">
              <a className="pp-page-nav-link" href="#gallery">Work</a>
              <a className="pp-page-nav-link" href="#reels">Reel</a>
              <a
                className="pp-page-nav-link"
                href="https://www.imdb.com/name/nm11744121"
                target="_blank"
                rel="noreferrer"
              >
                IMDb
              </a>
            </div>
          </div>

          <section id="gallery" className="pp-page-section" aria-label="Gallery">
            <PostProductionGallery />
          </section>

          <section id="reels" className="pp-page-section pp-reels-section" aria-label="Reels">
            <div className="pp-section-divider" aria-hidden="true" />
            <div className="pp-reels-frame">
              {!reelLoaded && !reelError ? (
                <div className="pp-media-skeleton" aria-hidden="true" />
              ) : null}
              <video
                className={`pp-reels-video ${reelLoaded || reelError ? 'pp-reels-video-loaded' : ''}`}
                controls
                preload="auto"
                playsInline
                onLoadedMetadata={() => setReelLoaded(true)}
                onCanPlay={() => setReelLoaded(true)}
                onError={() => setReelError(true)}
              >
                <source src="/assets/2024-sound-reel-web.mp4" type="video/mp4" />
              </video>
            </div>
          </section>
        </Container>
      </section>
    </main>
  )
};

export default FilmsPage;
