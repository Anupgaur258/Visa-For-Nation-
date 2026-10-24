import { useEffect, useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import Home from './pages/Home.jsx';
import DynamicPage from './pages/DynamicPage.jsx';
import VisaPage from './pages/VisaPage.jsx';
import { Blog, BlogPost } from './pages/Blog.jsx';
import News, { NewsPost } from './pages/News.jsx';
import Podcast from './pages/Podcast.jsx';
import About from './pages/About.jsx';
import Contact from './pages/Contact.jsx';
import Careers from './pages/Careers.jsx';
import { Awards, Gallery, Legal } from './pages/Static.jsx';
import Loader from './components/Loader.jsx';
import Admin from './admin/Admin.jsx';

export default function App() {
  const { pathname } = useLocation();
  const [splash, setSplash] = useState(!pathname.startsWith('/admin'));
  useEffect(() => { const t = setTimeout(() => setSplash(false), 1300); return () => clearTimeout(t); }, []);
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  if (pathname.startsWith('/admin')) return <Routes><Route path="/admin/*" element={<Admin />} /></Routes>;
  return (
    <>
      {splash && <Loader splash />}
      <Navbar />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact-us" element={<Contact />} />
          <Route path="/careers" element={<Careers />} />
          <Route path="/award-and-certificate" element={<Awards />} />
          <Route path="/our-gellary" element={<Gallery />} />
          <Route path="/terms-and-conditions" element={<Legal kind="terms" />} />
          <Route path="/privacy-policy" element={<Legal kind="privacy" />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/news" element={<News />} />
          <Route path="/news/:slug" element={<NewsPost />} />
          <Route path="/podcast" element={<Podcast />} />
          
          {/* Migrate - Canada */}
          <Route path="/visa/pr/canada" element={<VisaPage />} />
          <Route path="/migrate/canada/express-entry" element={<VisaPage />} />
          <Route path="/visa/pr/canada/pnp" element={<VisaPage />} />
          <Route path="/visa/canada/pnp/ontario" element={<VisaPage />} />
          <Route path="/visa/pr/canada/british-columbia-pnp" element={<VisaPage />} />
          <Route path="/visa/pr/canada/alberta-pnp" element={<VisaPage />} />
          <Route path="/visa/pr/canada/saskatchewan-pnp" element={<VisaPage />} />
          <Route path="/visa/pr/canada/nova-scotia-pnp" element={<VisaPage />} />
          
          {/* Migrate - Australia PR */}
          <Route path="/visa/pr/australia" element={<VisaPage />} />
          <Route path="/visa/pr/australia/subclass-189" element={<VisaPage />} />
          <Route path="/visa/pr/australia/subclass-190" element={<VisaPage />} />
          <Route path="/visa/pr/australia/subclass-491" element={<VisaPage />} />
          
          {/* Migrate - Other PR */}
          <Route path="/germany-opportunity-card" element={<VisaPage />} />
          <Route path="/portugal-job-seeker-visa" element={<VisaPage />} />
          
          {/* Migrate - Work Permits */}
          <Route path="/canada-work-permit" element={<VisaPage />} />
          <Route path="/australia-work-permit" element={<VisaPage />} />
          <Route path="/singapore-work-permit" element={<VisaPage />} />
          <Route path="/malta-work-permit" element={<VisaPage />} />
          <Route path="/ireland-work-visa" element={<VisaPage />} />
          
          {/* Migrate - Job Assistance */}
          <Route path="/greece-job-assistance" element={<VisaPage />} />
          <Route path="/netherlands-job-assistance" element={<VisaPage />} />
          <Route path="/switzerland-job-assistance" element={<VisaPage />} />
          <Route path="/uk-job-assistance" element={<VisaPage />} />
          <Route path="/luxembourg-job-assistance" element={<VisaPage />} />
          
          {/* Tourist - Top Destinations */}
          <Route path="/canada-tourist-visa" element={<VisaPage />} />
          <Route path="/usa-tourist-visa" element={<VisaPage />} />
          <Route path="/uk-tourist-visa" element={<VisaPage />} />
          <Route path="/australia-tourist-visa" element={<VisaPage />} />
          <Route path="/hong-kong-tourist-visa" element={<VisaPage />} />
          
          {/* Tourist - Schengen */}
          <Route path="/schengen-tourist-visa" element={<VisaPage />} />
          <Route path="/france-tourist-visa" element={<VisaPage />} />
          <Route path="/portugal-tourist-visa" element={<VisaPage />} />
          <Route path="/spain-tourist-visa" element={<VisaPage />} />
          <Route path="/denmark-tourist-visa" element={<VisaPage />} />
          
          {/* Tourist - Europe & Others */}
          <Route path="/ireland-tourist-visa" element={<VisaPage />} />
          <Route path="/slovakia-tourist-visa" element={<VisaPage />} />
          <Route path="/norway-tourist-visa" element={<VisaPage />} />
          <Route path="/luxembourg-tourist-visa" element={<VisaPage />} />
          <Route path="/lithuania-tourist-visa" element={<VisaPage />} />
          
          {/* Study Visa */}
          <Route path="/study-in-canada" element={<VisaPage />} />
          <Route path="/study-in-australia" element={<VisaPage />} />
          <Route path="/study-in-uk" element={<VisaPage />} />
          <Route path="/study-in-usa" element={<VisaPage />} />
          <Route path="/study-in-germany" element={<VisaPage />} />
          <Route path="/study-in-italy" element={<VisaPage />} />
          <Route path="/study-in-singapore" element={<VisaPage />} />
          <Route path="/study-in-ireland" element={<VisaPage />} />
          <Route path="/study-in-france" element={<VisaPage />} />
          <Route path="/study-in-newzealand" element={<VisaPage />} />
          <Route path="/study-in-hong-kong" element={<VisaPage />} />
          <Route path="/study-in-denmark" element={<VisaPage />} />
          
          {/* Services - Exams */}
          <Route path="/ielts" element={<VisaPage />} />
          <Route path="/pte" element={<VisaPage />} />
          <Route path="/duolingo-english-test" element={<VisaPage />} />
          <Route path="/gre-gmat" element={<VisaPage />} />
          
          {/* Services - Student Support */}
          <Route path="/education-counselling" element={<VisaPage />} />
          <Route path="/sop-lor-resume" element={<VisaPage />} />
          <Route path="/scholarship-guidance" element={<VisaPage />} />
          <Route path="/interview-preparation" element={<VisaPage />} />
          
          {/* Services - Settlement */}
          <Route path="/relocation-services" element={<VisaPage />} />
          <Route path="/post-landing-support" element={<VisaPage />} />
          <Route path="/pre-departure-orientation" element={<VisaPage />} />
          <Route path="/dependent-visa-assistance" element={<VisaPage />} />
          
          <Route path="*" element={<DynamicPage />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}
