import { useState } from 'react';
import { Container } from 'react-bootstrap';
import SocialLinks from '../components/social/SocialLinks';
import './LandingPage.css';

function LandingPage() {
  const [reelLoaded, setReelLoaded] = useState(false);
  const [reelError, setReelError] = useState(false);

  return (
    <main className="landing-page">
      <section className="landing-section">
        <Container>
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

          <SocialLinks links={[
            { href: 'https://www.instagram.com/brandonlien_/', ariaLabel: 'Instagram', iconClass: 'social-link-icon-instagram' },
            { href: 'https://www.imdb.com/name/nm11744121', ariaLabel: 'IMDb', iconClass: 'social-link-icon-imdb' },
            { href: 'https://www.youtube.com/channel/UCNZ_oSPzSEylE4HNqm6EoHg', ariaLabel: 'YouTube', iconClass: 'social-link-icon-youtube' },
            { href: 'https://brandonlien.bandcamp.com/', ariaLabel: 'Bandcamp', iconClass: 'social-link-icon-bandcamp' },
          ]} />
        </Container>
      </section>
    </main>
  );
}

export default LandingPage;
