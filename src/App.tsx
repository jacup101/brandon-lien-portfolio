import 'bootstrap/dist/css/bootstrap.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import FilmsPage from './pages/FilmsPage';
import LandingPage from './pages/LandingPage';
import './App.css';
import './index.css';
import NavBarComponent from './components/util/NavBarComponent';

function AppShell() {
  const navLinks = [
    { path: "/", label: "Post-Production Sound" },
    { path: "/about", label: "About" },
  ];

  return (
    <div className='app-root'>
      <NavBarComponent brand="Brandon Lien" links={navLinks} />
      <div className='page-content-padding'>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/archive" element={<HomePage />} />
          <Route path="/films" element={<FilmsPage />} />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppShell />
    </Router>
  );
}

export default App;
