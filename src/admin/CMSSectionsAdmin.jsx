import { useState } from 'react';
import CMSCollectionsAdmin from './CMSCollectionsAdmin.jsx';

const pages = [
  { id: 'home', label: 'Home page', sections: ['banner', 'goals', 'reel', 'testimonial', 'review'] },
  { id: 'about', label: 'About page', sections: ['team-image'] },
  { id: 'awards', label: 'Award page', sections: ['awards'] },
  { id: 'gallery', label: 'Gallery page', sections: ['gallery'] },
];
const pageGlyphs = { about: 'i', awards: 'A', gallery: 'G' };

export default function CMSSectionsAdmin() {
  const [page, setPage] = useState('home');
  const selected = pages.find(item => item.id === page) || pages[0];
  return <section className="adm-tab-panel adm-cms-home adm-cms-screen">
    <header className="adm-cms-screen-heading"><div><h2>Website Content</h2><p>Select a page, then choose the content section to update.</p></div></header>
    <div className="adm-cms-screen-layout">
      <nav className="adm-cms-page-list" aria-label="Website pages"><h3>Pages</h3>{pages.map(item => <button key={item.id} type="button" aria-current={page === item.id ? 'page' : undefined} className={`adm-cms-page-tab${page === item.id ? ' active' : ''}`} onClick={() => setPage(item.id)}><span className="adm-cms-page-icon" data-icon={item.id} aria-hidden="true">{item.id === 'home' ? <svg viewBox="0 0 24 24" focusable="false"><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z" /></svg> : pageGlyphs[item.id]}</span>{item.label}</button>)}</nav>
      <div className="adm-cms-screen-content"><CMSCollectionsAdmin key={page} page={page} sections={selected.sections} /></div>
    </div>
  </section>;
}
