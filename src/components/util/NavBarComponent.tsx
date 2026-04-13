import { Container, Nav, Navbar } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

interface NavbarProps {
    brand: string;
    links: { path: string; label: string }[];
}

const NavBarComponent: React.FC<NavbarProps> = ({ brand, links }) => {
    return (
      <Navbar
        bg="dark"
        variant="dark"
        expand="lg"
        fixed="top"
        style={{ background: 'rgba(17, 17, 17, 0.92)', backdropFilter: 'blur(14px)' }}
      >
        <Container fluid="lg">
          <LinkContainer to="/">
            <Navbar.Brand>{brand}</Navbar.Brand>
          </LinkContainer>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              {links.map((link, index) => (
                <LinkContainer key={index} to={link.path}>
                  <Nav.Link>{link.label}</Nav.Link>
                </LinkContainer>
              ))}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    );
  };
  
  export default NavBarComponent;
