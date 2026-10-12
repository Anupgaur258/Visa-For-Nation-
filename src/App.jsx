import { useEffect, useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import Home from './pages/Home.jsx';
import DynamicPage from './pages/DynamicPage.jsx';
import { Blog, BlogPost } from './pages/Blog.jsx';
import { About, Contact, Awards, Gallery, Legal } from './pages/Static.jsx';
import Loader from './components/Loader.jsx';
import Admin from './admin/Admin.jsx';

export default function App() {
  const { pathname } = useLocation();
  const [splash, setSplash] = useState(!pathname.startsWith('/admin'));
  useEffect(() => { const t = setTimeout(() => setSplash(false), 1300); return () => clearTimeout(t); }, []);
  useEffect(() => window.scrollTo(0, 0), [pathname]);
  if (pathname.startsWith('/admin')) return <Routes><Route path="/admin/*" element={<Admin />} /></Routes>;
  return (
    <>
      {splash && <Loader splash />}
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact-us" element={<Contact />} />
          <Route path="/award-and-certificate" element={<Awards />} />
          <Route path="/our-gellary" element={<Gallery />} />
          <Route path="/terms-and-conditions" element={<Legal kind="terms" />} />
          <Route path="/privacy-policy" element={<Legal kind="privacy" />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="*" element={<DynamicPage />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}
