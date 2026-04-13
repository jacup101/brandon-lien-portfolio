import { Card, Container } from 'react-bootstrap';
import SpotifyRow from '../components/spotify/SpotifyRow';
import SpotifyCard from '../components/spotify/SpotifyCard';

const HomePage = () => {
  return (
    <Container>
      <h1>What's Up</h1>
      <h2>I was thinking about making a website...</h2>
      <Card className='background-color'>
        <Card.Body>
          <Card.Title>
            I Love Pokimane
          </Card.Title>
          <Card.Body>
            Hello, this is my music below
          </Card.Body>
          <SpotifyRow width='400' uri='track/70uio0RwrQLipJQLAn14NJ'/>
          <SpotifyCard wide uri='album/28eKNxaUhILADxxdCh7kKy'/>
          <SpotifyCard uri='album/28eKNxaUhILADxxdCh7kKy'/>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default HomePage;