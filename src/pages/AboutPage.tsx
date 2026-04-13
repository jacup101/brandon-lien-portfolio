import { FormEvent, useState } from 'react';
import { Button, Col, Container, Form, Row } from 'react-bootstrap';
import './AboutPage.css';

function AboutPage() {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);

    setStatus('submitting');

    try {
      const response = await fetch('https://formsubmit.co/ajax/brandonlienaudio@gmail.com', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
        },
        body: formData,
      });

      const result = await response.json();

      if (response.ok && result.success === 'true') {
        setStatus('success');
        form.reset();
        return;
      }

      setStatus('error');
    } catch {
      setStatus('error');
    }
  };

  return (
    <main className="about-page">
      <Container>
        <section className="about-hero">
          <div className="about-hero-media">
            <div className="about-portrait-frame">
              <img
                className="about-portrait"
                src="/assets/about-web/portrait-main.jpg"
                alt="Portrait of Brandon Lien"
                loading="eager"
                decoding="async"
                fetchPriority="high"
              />
            </div>
          </div>

          <div className="about-hero-copy">
            <p className="about-kicker">About Me</p>
            <h1 className="about-title">Brandon Lien</h1>
            <p className="about-lead">
              Vietnamese and Teochew American artist from Los Angeles working across
              post-production sound, filmmaking, and music.
            </p>

            <div className="about-link-row" aria-label="External links">
              <a
                className="about-link-icon about-link-icon-instagram"
                href="https://www.instagram.com/brandonlien_/"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
              />
              <a
                className="about-link-icon about-link-icon-imdb"
                href="https://www.imdb.com/name/nm11744121"
                target="_blank"
                rel="noreferrer"
                aria-label="IMDb"
              />
            </div>
          </div>
        </section>

        <Row className="justify-content-center">
          <Col xl={10}>
            <section className="about-section about-copy-section">
              <div className="about-copy-grid">
                <p>
                  My name is Brandon Lien, and I&apos;m a Vietnamese and Teochew American
                  artist from Los Angeles, CA. My personal philosophy is to stay adaptable
                  and be willing to learn from any discipline. All of my interests,
                  experiences, and work are a part of who I am professionally and
                  artistically.
                </p>

                <p>
                  I am a sound artist with a wide array of experience, from sound design,
                  mixing in stereo and surround, dialogue editing, sound effects editing,
                  foley, field recording, and file delivery. I take pride in being a trusted
                  collaborator that can ideate creative and technical solutions to challenges.
                </p>

                <p>
                  I graduated from California State University Northridge in 2022 with a
                  Bachelor of Arts in Film Production and started my career in post
                  production sound with internships at Formosa Group and Enhanced Media.
                  Since then, my work has screened at numerous film festivals, theaters, and
                  streaming services like Amazon Prime, Lifetime, and Tubi.
                </p>

                <p>
                  In other areas of filmmaking, I have experience doing video editing,
                  directing, and cinematography. I have worked with the Tom &amp; Ethel
                  Bradley Center, Museum of Social Justice, and Guitar Foundation of America
                  on projects. As a musician, I have released two albums (with one more on
                  the way) and have worked on multiple collaborations.
                </p>

                <p className="about-copy-closing">
                  This website serves as a portfolio, a journal, a love letter, and a
                  representation of the multitudes of things that make up who I am. Thanks
                  for visiting.
                </p>
              </div>
            </section>

            <section className="about-image-strip about-section" aria-label="Additional portraits">
              <div className="about-strip-image-frame">
                <img
                  src="/assets/about-web/banner-1.jpg"
                  alt="Brandon Lien portrait"
                  className="about-strip-image"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div className="about-strip-image-frame">
                <img
                  src="/assets/about-web/banner-2.jpg"
                  alt="Brandon Lien portrait"
                  className="about-strip-image"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div className="about-strip-image-frame">
                <img
                  src="/assets/about-web/banner-3.jpg"
                  alt="Brandon Lien portrait"
                  className="about-strip-image"
                  loading="lazy"
                  decoding="async"
                />
              </div>
            </section>

            <section className="about-section about-contact-section">
              <div className="about-contact-header">
                <p className="about-kicker">Contact</p>
                <h2 className="about-subtitle">Get In Touch</h2>
              </div>

              <Form className="about-form" onSubmit={handleSubmit}>
                <input type="hidden" name="_subject" value="New message from Brandon Lien Portfolio" />
                <input type="hidden" name="_template" value="table" />
                <input type="hidden" name="_honey" />

                <Row className="g-3">
                  <Col md={6}>
                    <Form.Group controlId="contactName">
                      <Form.Label>Name</Form.Label>
                      <Form.Control type="text" name="name" placeholder="Your name" required />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group controlId="contactEmail">
                      <Form.Label>Email</Form.Label>
                      <Form.Control type="email" name="email" placeholder="you@example.com" required />
                    </Form.Group>
                  </Col>

                  <Col xs={12}>
                    <Form.Group controlId="contactSubject">
                      <Form.Label>Subject</Form.Label>
                      <Form.Control
                        type="text"
                        name="subject"
                        placeholder="What are you reaching out about?"
                        required
                      />
                    </Form.Group>
                  </Col>

                  <Col xs={12}>
                    <Form.Group controlId="contactMessage">
                      <Form.Label>Message</Form.Label>
                      <Form.Control
                        as="textarea"
                        name="message"
                        rows={6}
                        placeholder="Write your message here"
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <div className="about-form-actions">
                  <Button type="submit" className="about-submit-button" disabled={status === 'submitting'}>
                    {status === 'submitting' ? 'Sending...' : 'Send Message'}
                  </Button>
                  {status === 'success' ? (
                    <p className="about-form-status">Message sent successfully.</p>
                  ) : null}
                  {status === 'error' ? (
                    <p className="about-form-status about-form-status-error">
                      FormSubmit may still need its first-time activation email confirmed for
                      `brandonlienaudio@gmail.com`.
                    </p>
                  ) : null}
                </div>
              </Form>
            </section>
          </Col>
        </Row>
      </Container>
    </main>
  );
}

export default AboutPage;
