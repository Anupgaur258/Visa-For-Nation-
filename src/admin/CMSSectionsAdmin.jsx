import { useState } from 'react';
import CMSCollectionsAdmin from './CMSCollectionsAdmin.jsx';

const pages = [
  { id: 'home', label: 'Home page', sections: ['banner', 'reel', 'testimonial', 'review'] },
  { id: 'about', label: 'About page', sections: ['team-image'] },
  { id: 'awards', label: 'Award page', sections: ['awards'] },
];

export default function CMSSectionsAdmin() {
  const [page, setPage] = useState('home');
  const selected = pages.find(item => item.id === page) || pages[0];
  return <section className="adm-tab-panel adm-cms-home">
    <div className="adm-section-heading"><div><h2>Content management</h2><p>Choose a page and update its existing content sections.</p></div></div>
    <nav className="adm-cms-page-tabs" aria-label="CMS pages">{pages.map(item => <button key={item.id} type="button" className={`adm-cms-page-tab${page === item.id ? ' active' : ''}`} onClick={() => setPage(item.id)}>{item.label}</button>)}</nav>
    <CMSCollectionsAdmin key={page} page={page} sections={selected.sections} />
  </section>;
}