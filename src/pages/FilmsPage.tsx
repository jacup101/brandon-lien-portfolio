import { useState } from 'react';
import { Container } from 'react-bootstrap';
import PostProductionGallery from '../components/postProduction/PostProductionGallery';

const FilmsPage = () => {
  const [reelLoaded, setReelLoaded] = useState(false);

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
              {!reelLoaded ? (
                <div className="pp-media-skeleton" aria-hidden="true" />
              ) : null}
              <iframe
                className={`pp-reels-embed ${reelLoaded ? 'pp-reels-embed-loaded' : ''}`}
                src="https://www.youtube.com/embed/GX-h4We5vtw?rel=0&modestbranding=1&playsinline=1"
                title="Post-production sound reel"
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                onLoad={() => setReelLoaded(true)}
              />
            </div>
          </section>
        </Container>
      </section>
    </main>
  );
};

export default FilmsPage;
