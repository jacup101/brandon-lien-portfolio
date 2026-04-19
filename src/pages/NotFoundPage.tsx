import { Link } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import { useEffect } from 'react';

const NotFoundPage = () => {
  useEffect(() => {
    document.title = '404 | Brandon Lien';
  }, []);

  return (
    <main>
      <Container style={{ padding: '6rem 1rem', textAlign: 'center' }}>
        <img
          src="/assets/404notfound.JPG"
          alt="404 Not Found"
          style={{ maxWidth: '100%', width: '480px', display: 'block', margin: '0 auto 2rem' }}
        />
        <p style={{ color: 'var(--site-muted)', fontSize: '0.82rem', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '1.5rem' }}>
          404 — Page Not Found
        </p>
        <Link to="/" style={{ color: 'var(--site-accent)', fontSize: '0.82rem', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          ← Home
        </Link>
      </Container>
    </main>
  );
};

export default NotFoundPage;
