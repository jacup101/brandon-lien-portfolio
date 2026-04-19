import 'bootstrap/dist/css/bootstrap.css';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { useEffect } from 'react';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

const PAGE_TITLES: Record<string, string> = {
  '/': 'Brandon Lien',
  '/post-sound': 'Post Sound | Brandon Lien',
  '/films': 'Post Sound | Brandon Lien',
  '/film': 'Film | Brandon Lien',
  '/music': 'Music | Brandon Lien',
  '/about': 'About | Brandon Lien',
};

function PageTitle() {
  const { pathname } = useLocation();
  useEffect(() => {
    const title = PAGE_TITLES[pathname];
    if (title) document.title = title;
  }, [pathname]);
  return null;
}
import AboutPage from './pages/AboutPage';
import FilmDetailPage from './pages/FilmDetailPage';
import FilmPage from './pages/FilmPage';
import FilmsPage from './pages/FilmsPage';
import LandingPage from './pages/LandingPage';
import MusicDetailPage from './pages/MusicDetailPage';
import MusicPage from './pages/MusicPage';
import './App.css';
import './index.css';
import NavBarComponent from './components/util/NavBarComponent';

function AppShell() {
  const navLinks = [
    { path: "/post-sound", label: "Post Sound" },
    { path: "/film", label: "Film" },
    { path: "/music", label: "Music" },
    { path: "/about", label: "About" },
  ];

  return (
    <div className='app-root'>
      <ScrollToTop />
      <PageTitle />
      <NavBarComponent brand="Brandon Lien" links={navLinks} />
      <div className='page-content-padding'>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/post-sound" element={<FilmsPage />} />
          <Route path="/film" element={<FilmPage />} />
          <Route path="/film/:slug" element={<FilmDetailPage />} />
          <Route path="/music" element={<MusicPage />} />
          <Route path="/music/:slug" element={<MusicDetailPage />} />
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
