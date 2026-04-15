import { useEffect, useState } from 'react';
import { Container, Nav, Navbar } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';
import { LinkContainer } from 'react-router-bootstrap';

interface NavbarProps {
    brand: string;
    links: { path: string; label: string }[];
}

const NavBarComponent: React.FC<NavbarProps> = ({ brand, links }) => {
    const [expanded, setExpanded] = useState(false);
    const location = useLocation();

    useEffect(() => {
      setExpanded(false);
    }, [location.pathname]);

    return (
      <Navbar
        expand="lg"
        fixed="top"
        className="site-navbar"
        expanded={expanded}
      >
        <Container fluid="lg">
          <LinkContainer to="/" onClick={() => setExpanded(false)}>
            <Navbar.Brand className="site-navbar-brand">{brand}</Navbar.Brand>
          </LinkContainer>
          <Navbar.Toggle
            aria-controls="basic-navbar-nav"
            className="site-navbar-toggle"
            onClick={() => setExpanded((current) => !current)}
          />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto site-navbar-links">
              {links.map((link, index) => (
                <LinkContainer key={index} to={link.path} onClick={() => setExpanded(false)}>
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
