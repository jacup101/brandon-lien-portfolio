import { FormEvent, useState } from 'react';
import { Button, Col, Container, Form, Row } from 'react-bootstrap';
import './AboutPage.css';

function AboutPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <main className="about-page">
      <Container>
        <Row className="justify-content-center">
          <Col xl={10}>
            <section className="about-section">
              <p className="about-kicker">About Me</p>
              <h1 className="about-title">Brandon Lien</h1>

              <div className="about-copy">
                <p>
                  My name is Brandon Lien, and I&apos;m a Vietnamese and Teochew American
                  artist from Los Angeles, CA. My personal philosophy is to stay adaptable
                  and be willing to learn from any discipline. All of my interests,
                  experiences, and work are a part of who I am professionally and
                  artistically. And as a reflection of this eclectic array of things I
                  connect with, I hope that my work can also connect with someone and share
                  a moment of vulnerability.
                </p>

                <p>
                  My work in film primarily centers around sound design and video editing,
                  but I have also done directing and cinematography. I graduated from
                  California State University Northridge in 2022 with a Bachelor of Arts in
                  Cinema and Television Arts and started my career in post production sound
                  with internships at Formosa Group and Enhanced Media. I have also worked
                  with the Tom &amp; Ethel Bradley Center, Museum of Social Justice, and
                  Guitar Foundation of America on projects.
                </p>

                <p>
                  As a musician, I have released two albums (with one more on the way) and
                  have worked on multiple collaborations.
                </p>

                <p>
                  This website serves as a portfolio, a journal, a love letter, and a
                  representation of the multitudes of things that make up who I am. Thanks
                  for visiting.
                </p>
              </div>
            </section>

            <section className="about-section">
              <div className="about-contact-header">
                <p className="about-kicker">Contact</p>
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
                      <Form.Control type="text" name="subject" placeholder="What are you reaching out about?" required />
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
                  <Button type="submit" className="about-submit-button">
                    Send Message
                  </Button>
                  {submitted ? (
                    <p className="about-form-note">
                      Thanks. The form layout is ready and can be wired to a backend or email service next.
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
