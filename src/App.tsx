import 'bootstrap/dist/css/bootstrap.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AboutPage from './pages/AboutPage';
import FilmDetailPage from './pages/FilmDetailPage';
import FilmPage from './pages/FilmPage';
import FilmsPage from './pages/FilmsPage';
import LandingPage from './pages/LandingPage';
import './App.css';
import './index.css';
import NavBarComponent from './components/util/NavBarComponent';

function AppShell() {
  const navLinks = [
    { path: "/post-sound", label: "Post Sound" },
    { path: "/film", label: "Film" },
    { path: "/about", label: "About" },
  ];

  return (
    <div className='app-root'>
      <NavBarComponent brand="Brandon Lien" links={navLinks} />
      <div className='page-content-padding'>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/post-sound" element={<FilmsPage />} />
          <Route path="/film" element={<FilmPage />} />
          <Route path="/film/:slug" element={<FilmDetailPage />} />
          <Route path="/about" element={<AboutPage />} />
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
