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
        <p style={{ color: 'var(--site-muted)', fontSize: '0.82rem', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '1rem' }}>
          404 — Page Not Found
        </p>
        <Link to="/" style={{ color: 'var(--site-text)', fontSize: '0.82rem', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          ← Home
        </Link>
        <img
          src="/assets/404notfound.JPG"
          alt="404 Not Found"
          style={{ maxWidth: '100%', width: '260px', display: 'block', margin: '2.5rem auto 0' }}
        />
      </Container>
    </main>
  );
};

export default NotFoundPage;
