import { useState } from 'react';
import { Container } from 'react-bootstrap';
import './LandingPage.css';

function LandingPage() {
  const [reelLoaded, setReelLoaded] = useState(false);
  const [reelError, setReelError] = useState(false);

  return (
    <main className="landing-page">
      <section className="landing-section">
        <Container>
          <div className="landing-intro">
            <p className="landing-intro-line">Filmmaker | Musician | Artist</p>
          </div>

          <section className="landing-reel-section" aria-label="Film reel">
            <div className="landing-reel-frame">
              {!reelLoaded && !reelError ? (
                <div className="landing-media-skeleton" aria-hidden="true" />
              ) : null}
              <video
                className={`landing-reel-video ${
                  reelLoaded || reelError ? 'landing-reel-video-loaded' : ''
                }`}
                autoPlay
                muted
                loop
                preload="auto"
                playsInline
                disablePictureInPicture
                onLoadedMetadata={() => setReelLoaded(true)}
                onCanPlay={() => setReelLoaded(true)}
                onError={() => setReelError(true)}
              >
                <source src="/assets/loop-web-silent.mp4" type="video/mp4" />
              </video>
            </div>
          </section>
        </Container>
      </section>
    </main>
  );
}

export default LandingPage;
