import { FormEvent, useEffect, useId, useRef, useState } from 'react';
import { Button, Col, Container, Form, Row } from 'react-bootstrap';
import SocialLinks from '../components/social/SocialLinks';
import './AboutPage.css';

type FormStatus = 'idle' | 'submitting' | 'success' | 'error';

const TURNSTILE_SCRIPT_ID = 'cf-turnstile-script';
const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;
const bypassTurnstile = import.meta.env.VITE_BYPASS_TURNSTILE === 'true';

function getErrorMessage(statusCode: number) {
  if (statusCode === 400) {
    return 'Please complete the captcha and double-check your message details.';
  }

  if (statusCode === 503) {
    return 'The contact form is still being configured. Please try again soon.';
  }

  return 'Something went wrong while sending your message. Please try again.';
}

function AboutPage() {
  const [status, setStatus] = useState<FormStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const [isTurnstileReady, setIsTurnstileReady] = useState(false);
  const turnstileContainerId = useId();
  const widgetIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!turnstileSiteKey || bypassTurnstile) {
      return;
    }

    const renderWidget = () => {
      if (!window.turnstile || widgetIdRef.current) {
        return;
      }

      const container = document.getElementById(turnstileContainerId);

      if (!container) {
        return;
      }

      widgetIdRef.current = window.turnstile.render(container, {
        sitekey: turnstileSiteKey,
        theme: 'light',
        action: 'contact',
        callback: (token) => {
          setTurnstileToken(token);
          setIsTurnstileReady(true);
        },
        'expired-callback': () => {
          setTurnstileToken('');
          setIsTurnstileReady(true);
        },
        'error-callback': () => {
          setTurnstileToken('');
          setIsTurnstileReady(true);
        },
      });

      setIsTurnstileReady(true);
    };

    if (window.turnstile) {
      renderWidget();
      return;
    }

    const existingScript = document.getElementById(TURNSTILE_SCRIPT_ID) as HTMLScriptElement | null;

    if (existingScript) {
      existingScript.addEventListener('load', renderWidget);

      return () => {
        existingScript.removeEventListener('load', renderWidget);
      };
    }

    const script = document.createElement('script');
    script.id = TURNSTILE_SCRIPT_ID;
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async = true;
    script.defer = true;
    script.addEventListener('load', renderWidget);
    document.head.appendChild(script);

    return () => {
      script.removeEventListener('load', renderWidget);
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [turnstileContainerId]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
    const name = formData.get('name')?.toString().trim() ?? '';
    const email = formData.get('email')?.toString().trim() ?? '';
    const subject = formData.get('subject')?.toString().trim() ?? '';
    const message = formData.get('message')?.toString().trim() ?? '';

    if (!turnstileSiteKey && !bypassTurnstile) {
      setErrorMessage('The contact form is missing its public captcha key.');
      setStatus('error');
      return;
    }

    if (!bypassTurnstile && !turnstileToken) {
      setErrorMessage('Please complete the captcha before sending your message.');
      setStatus('error');
      return;
    }

    setStatus('submitting');
    setErrorMessage('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          subject,
          message,
          turnstileToken: bypassTurnstile ? undefined : turnstileToken,
        }),
      });

      if (response.ok) {
        setStatus('success');
        setTurnstileToken('');
        form.reset();

        if (widgetIdRef.current && window.turnstile) {
          window.turnstile.reset(widgetIdRef.current);
        }

        return;
      }

      setErrorMessage(getErrorMessage(response.status));
      setStatus('error');
    } catch {
      setErrorMessage('Something went wrong while sending your message. Please try again.');
      setStatus('error');
    }
  };

  return (
    <main className="about-page">
      <Container>
        <section className="about-hero">
          <div className="about-hero-copy">
            <div className="about-copy-grid about-copy-grid-hero">
              <p>
                My name is Brandon Lien, and I&apos;m a Vietnamese and Teochew American
                artist from Los Angeles, CA. My personal philosophy is to stay adaptable
                and be willing to learn from any discipline. All of my interests,
                experiences, and work are a part of who I am professionally and
                artistically.
              </p>

              <p>
                I am a sound artist with a wide array of experience, from sound design,
                mixing in stereo and 5.1 surround, dialogue editing, sound effects
                editing, foley, field recording, audio restoration, and file delivery. I
                take pride in being a trusted collaborator that can ideate creative and
                technical solutions to challenges.
              </p>

              <p>
                I started my career in post-production sound with internships at Formosa
                Group and Enhanced Media. Since then, my work has screened at numerous
                film festivals, theaters, and streaming services like Amazon Prime,
                Lifetime, and Tubi.
              </p>

              <p>
                In other areas of filmmaking, I have experience doing video editing,
                directing, and cinematography. As a musician, I have released two albums
                (with one more on the way) and have worked on multiple collaborations.
              </p>

              <p>
                This website serves as a portfolio, a journal, a love letter, and a
                representation of the multitudes of things that make up who I am. Thanks
                for visiting.
              </p>
            </div>
          </div>

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

            <SocialLinks links={[
              { href: 'https://www.instagram.com/brandonlien_/', ariaLabel: 'Instagram', iconClass: 'social-link-icon-instagram' },
              { href: 'https://www.imdb.com/name/nm11744121', ariaLabel: 'IMDb', iconClass: 'social-link-icon-imdb' },
              { href: 'https://www.youtube.com/channel/UCNZ_oSPzSEylE4HNqm6EoHg', ariaLabel: 'YouTube', iconClass: 'social-link-icon-youtube' },
              { href: 'https://brandonlien.bandcamp.com/', ariaLabel: 'Bandcamp', iconClass: 'social-link-icon-bandcamp' },
            ]} />
          </div>
        </section>

        <Row className="justify-content-center">
          <Col xl={10}>
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
                <h2 className="about-subtitle">Contact Me</h2>
              </div>

              <Form className="about-form" onSubmit={handleSubmit}>
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

                <div className="about-captcha-block">
                  {bypassTurnstile ? (
                    <p className="about-form-status">
                      Captcha is bypassed for local development.
                    </p>
                  ) : turnstileSiteKey ? (
                    <>
                      <div id={turnstileContainerId} className="about-turnstile" />
                      {!isTurnstileReady ? (
                        <p className="about-form-status">Loading spam protection...</p>
                      ) : null}
                    </>
                  ) : (
                    <p className="about-form-status about-form-status-error">
                      Add `VITE_TURNSTILE_SITE_KEY` to enable the contact form.
                    </p>
                  )}
                </div>

                <div className="about-form-actions">
                  <Button
                    type="submit"
                    className="about-submit-button"
                    disabled={status === 'submitting' || (!turnstileSiteKey && !bypassTurnstile)}
                  >
                    {status === 'submitting' ? 'Sending...' : 'Send Message'}
                  </Button>
                  {status === 'success' ? (
                    <p className="about-form-status">Message sent successfully.</p>
                  ) : null}
                  {status === 'error' ? (
                    <p className="about-form-status about-form-status-error">
                      {errorMessage}
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
