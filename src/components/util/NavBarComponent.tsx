import { Container, Nav, Navbar } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

interface NavbarProps {
    brand: string;
    links: { path: string; label: string }[];
}

const NavBarComponent: React.FC<NavbarProps> = ({ brand, links }) => {
    return (
      <Navbar
        expand="lg"
        fixed="top"
        className="site-navbar"
      >
        <Container fluid="lg">
          <LinkContainer to="/">
            <Navbar.Brand className="site-navbar-brand">{brand}</Navbar.Brand>
          </LinkContainer>
          <Navbar.Toggle aria-controls="basic-navbar-nav" className="site-navbar-toggle" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto site-navbar-links">
              {links.map((link, index) => (
                <LinkContainer key={index} to={link.path}>
                  <Nav.Link className="site-navbar-link">{link.label}</Nav.Link>
                </LinkContainer>
              ))}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    );
  };
  
  export default NavBarComponent;
