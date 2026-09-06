import { Col, Row } from 'react-bootstrap';
import SocialLinks from '../social/SocialLinks';
import type { AboutContent } from '../../data/aboutContent';

// The CMS-editable part of the About page (bio, portrait, photo strip,
// social links) — extracted out of AboutPage the same way FilmDetailView
// and MusicDetailView were, so the admin editor's live preview renders
// the exact same thing a visitor sees. The contact form isn't part of
// this: it's static markup with its own submission logic, not schema
// data, so AboutPage renders it separately and it's never duplicated
// into the preview.
interface AboutContentViewProps {
  content: AboutContent;
}

function AboutContentView({ content }: AboutContentViewProps) {
  return (
    <>
      <section className="about-hero">
        <div className="about-hero-copy">
          <div className="about-copy-grid about-copy-grid-hero">
            {content.bioParagraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>

        <div className="about-hero-media">
          <div className="about-portrait-frame">
            {content.portraitImage && (
              <img
                className="about-portrait"
                src={content.portraitImage}
                alt="Portrait of Brandon Lien"
                loading="eager"
                decoding="async"
                fetchPriority="high"
              />
            )}
          </div>

          <SocialLinks links={content.socialLinks} />
        </div>
      </section>

      <Row className="justify-content-center">
        <Col xl={10}>
          <section className="about-image-strip about-section" aria-label="Additional portraits">
            {content.stripImages.map((image) => (
              <div key={image.path} className="about-strip-image-frame">
                <img
                  src={image.path}
                  alt="Brandon Lien portrait"
                  className={`about-strip-image${image.cropTop ? ' about-strip-image-top' : ''}`}
                  loading="lazy"
                  decoding="async"
                />
              </div>
            ))}
          </section>
        </Col>
      </Row>
    </>
  );
}

export default AboutContentView;
