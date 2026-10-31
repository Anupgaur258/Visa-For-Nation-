import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, img, adminImg, UPLOAD } from '../api.js';
import { FALLBACK_POSTS } from '../data/postsData.js';
import Loader from '../components/Loader.jsx';
import Reveal from '../components/Reveal.jsx';
import SEOHead from '../components/SEOHead.jsx';
import EnquiryForm from '../components/EnquiryForm.jsx';
import './Blog.css';

const UPLOAD_BASE = String(UPLOAD || import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, '') || '').replace(/\/+$/, '');
const pic = p => {
  if (!p) return '';
  if (/^https?:/i.test(p)) return p;
  const path = p.replace(/^\/+/, '');
  if (path.startsWith('uploads/')) return `${UPLOAD_BASE}/${path}`;
  return adminImg(p) || img(p);
};
const handleBlogImageError = event => {
  const image = event.currentTarget;
  const path = image.dataset.imagePath || '';
  const filename = path.split('/').filter(Boolean).pop();
  if (/^\/?uploads\/[^/]+\//.test(path) && filename && image.dataset.legacyFallback !== 'true' && UPLOAD_BASE) {
    image.dataset.legacyFallback = 'true';
    image.src = `${UPLOAD_BASE}/uploads/${encodeURIComponent(filename)}`;
    return;
  }
  image.hidden = true;
};
const handleBlogImageLoad = event => {
  event.currentTarget.style.opacity = '1';
};
const date = d => new Date(d || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
const COUNTRY_FILTERS = ['Canada', 'Australia', 'Ireland', 'USA', 'Germany', 'Austria'];
const FILTER_ALIASES = { USA: ['usa', 'united states', 'u.s.'] };
const matchesFilter = (post, filter) => {
  const text = `${post.category || ''} ${post.subCategory || ''} ${post.title || ''} ${post.metaDescription || ''}`.toLowerCase();
  return (FILTER_ALIASES[filter] || [filter.toLowerCase()]).some(alias => text.includes(alias.toLowerCase()));
};

const Card = ({ p, i, type = 'blog' }) => (
  <Reveal from={['left', 'up', 'right'][i % 3]} delay={i * 80} as={Link} to={`/${type}/${p.slug}`} className="bl-card">
    <div className="bl-card-img">
      <img src={pic(p.image)} data-image-path={p.image} alt={p.title} loading="lazy" style={{ opacity: 0 }} onLoad={handleBlogImageLoad} onError={handleBlogImageError} />
    </div>
    <div className="bl-card-body">
      <div className="bl-card-meta">
        <span>{p.category}</span>
        <span className="bl-dot" aria-hidden="true" />
        <time>{date(p.createdAt)}</time>
      </div>
      {/* our blog title  */}
      
      <h3>{p.title}</h3>
      <div className="bl-card-footer">
        <span>Read article</span>
        <i aria-hidden="true">→</i>
      </div>
    
    </div>
  </Reveal>
);

export function Blog() { return <PostsListing type="blog" />; }

export function News() { return <PostsListing type="news" />; }

// post listing with type 

function PostsListing({ type }) {
  const isNews = type === 'news';
  const pageTitle = isNews ? 'Immigration News | Visa For Nation' : 'Immigration Blog & Visa Guides | Visa For Nation';
  const [posts, setPosts] = useState([]);
  const [category, setCategory] = useState('All');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
//  api call 

  useEffect(() => {
    document.title = pageTitle;
    let active = true;
    setLoading(true);
    setLoadError('');
    api(`/${type}`)
      .then(items => {
        if (active) setPosts(Array.isArray(items) ? items : []);
      })
      .catch(error => {
        if (active) {
          setPosts([]);
          setLoadError(error.message || `Could not load ${isNews ? 'news articles' : 'blog posts'}.`);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [type, isNews, pageTitle]);

  const sortedPosts = [...(posts || [])].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  const featuredPost = sortedPosts[0];
  const extraCategories = [...new Set(sortedPosts.map(post => post.category?.trim()).filter(value => value && value.toLowerCase() !== 'visa'))]
    .map(value => value.replace(/\b\w/g, letter => letter.toUpperCase()))
    .filter(value => !COUNTRY_FILTERS.some(country => matchesFilter({ category: value }, country)));
  const categories = ['All', ...COUNTRY_FILTERS, ...extraCategories];
  const filteredPosts = sortedPosts.slice(featuredPost ? 1 : 0).filter(post =>
    (category === 'All' || matchesFilter(post, category)) &&
    (!query.trim() || `${post.title} ${post.metaDescription} ${post.category}`.toLowerCase().includes(query.trim().toLowerCase()))
  );

  return (
    <main className="bl">
      <SEOHead
        title={isNews ? 'Immigration News & Updates | Visa For Nation' : 'Immigration Blog & Visa Insights | Visa For Nation'}
        description={isNews ? 'The latest immigration, visa, study, and work permit news and updates from Visa For Nation.' : 'Latest guides, news and expert insights on Canada PR, Australia PR, Study Visas, Work Permits, and Tourist Visas from Visa For Nation.'}
      />

      <section className="bl-sec bl-hero">
        <div className="bl-wrap">
          <Reveal from="up">
            <div className="bl-head">
              <span className="bl-eyebrow">{isNews ? 'Newsroom' : 'Our Blog'}</span>
              <h2 className="bl-h2">Immigration <em>{isNews ? 'News' : 'Insights'}</em></h2>
              <p className="bl-lead">{isNews ? 'The latest visa, immigration, study, and work updates.' : 'Guides, updates and expert advice on PR, work and study visas.'}</p>
            </div>
          </Reveal>

        </div>
      </section>
      <section className="bl-sec bl-featured-section">
        <div className="bl-wrap">
          {featuredPost && <Reveal from="up" delay={80}>
            <Link className="bl-featured" to={`/${type}/${featuredPost.slug}`}>
              <div className="bl-featured-img"><img src={pic(featuredPost.image)} data-image-path={featuredPost.image} alt={featuredPost.title} style={{ opacity: 0 }} onLoad={handleBlogImageLoad} onError={handleBlogImageError} /></div>
              <div className="bl-featured-copy">
                <span className="bl-featured-label">{isNews ? 'Latest News' : 'Latest Article'}</span>
                <div className="bl-card-meta"><span>{featuredPost.category}</span><span className="bl-dot" aria-hidden="true" /><time>{date(featuredPost.createdAt)}</time></div>
                <h2>{featuredPost.title}</h2>
                <span className="bl-featured-link">Read the latest article <b aria-hidden="true">→</b></span>
              </div>
            </Link>
          </Reveal>}
          <div className="bl-toolbar">
            <label className="bl-search"><span className="bl-visually-hidden">Search articles</span><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search articles..." /><span aria-hidden="true">⌕</span></label>
            <div className="bl-filters" aria-label="Filter articles by category">
              {categories.map(item => <button type="button" key={item} className={category === item ? 'active' : ''} onClick={() => setCategory(item)}>{item}</button>)}
            </div>
          </div>
          <div className="bl-grid">
            {filteredPosts.length ? filteredPosts.map((p, i) => <Card key={p._id || p.slug} p={p} i={i} type={type} />) : <p className="bl-empty">{loading ? `Loading ${isNews ? 'news articles' : 'blog posts'}...` : loadError || (posts.length ? `No ${isNews ? 'news items' : 'articles'} match your search. Try another keyword or category.` : `No ${isNews ? 'news updates' : 'articles'} have been published yet.`)}</p>}
          </div>
        </div>
      </section>
    </main>
  );
}


export function BlogPost() { return <PostDetail type="blog" />; }
export function NewsPost() { return <PostDetail type="news" />; }

function PostDetail({ type }) {
  const { slug } = useParams();
  const fallback = type === 'blog' ? FALLBACK_POSTS.find(p => p.slug === slug) : null;
  const [d, setD] = useState(fallback ? { post: fallback, related: FALLBACK_POSTS.filter(p => p.slug !== slug).slice(0, 3) } : null);

  useEffect(() => {
    api(`/${type}/${slug}`)
      .then(x => {
        setD(x);
      })
      .catch(() => {
        if (!fallback) setD(false);
      });
  }, [slug, fallback, type]);

  if (d === false) return (
    <main className="bl">
      <section className="bl-sec bl-hero">
        <div className="bl-wrap">
          <Reveal from="up">
            <div className="bl-notfound" style={{ textAlign: 'center', padding: '60px 20px' }}>
              <h1 style={{ fontSize: '72px', color: '#B51226', margin: '0 0 16px 0' }}>404</h1>
              <p style={{ fontSize: '18px', color: '#64748B', marginBottom: '24px' }}>{type === 'news' ? 'News article not found.' : 'Post not found.'}</p>
              <Link className="bl-btn red btn btn-red" to={`/${type}`}>Back to {type === 'news' ? 'news' : 'blog'}</Link>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );

  if (!d) return (
    <main className="bl">
      <section className="bl-sec bl-hero">
        <div className="bl-wrap"><Loader splash /></div>
      </section>
    </main>
  );

  const { post, related } = d;
  return (
    <main className="bl" style={{backgroundColor:"#0b1121"}}>
      <SEOHead
        title={post.metaTitle || post.title}
        description={post.metaDescription}
      />

      <section className="bl-sec bl-post-hero" style={{backgroundColor:"#0b1121"}}>
        <div className="bl-wrap">
          <Reveal from="up">
            <span className="bl-eyebrow">{post.category}</span>
            <h2 className="bl-h2">{post.title}</h2>
            <div className="bl-post-meta">
              <time>{date(post.createdAt)}</time>
              <span className="bl-dot" aria-hidden="true"/>
              <span>{post.views || 1} views</span>



               {/* <span> this is the  content for the pr and the study vsa </span>
               <p> this is work for the { obj}  {obj.metaDes} </p>
               <span>  right logo {logo.right.next} </span> 
               <meta>description </meta>
               port = 5454148 <section>
               home 
               </section>
               <section>
               about 
               </section>

                */}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bl-sec">
        <div className="bl-wrap bl-post-grid">
          <div className="bl-post-main">
            {post.image && (
              <div className="bl-post-cover" style={{ marginBottom: '24px', borderRadius: '12px', overflow: 'hidden' }}>
                <img src={pic(post.image)} data-image-path={post.image} alt={post.title} style={{ width: '100%', maxHeight: '420px', objectFit: 'cover', opacity: 0 }} onLoad={handleBlogImageLoad} onError={handleBlogImageError} />
              </div>
            )}
            <div className="bl-prose" dangerouslySetInnerHTML={{ __html: post.content }} />
          </div>

          <aside className="bl-post-sidebar">
            <EnquiryForm variant="card" title="Ask an Immigration Expert" sub="Free profile evaluation for PR, Study or Work" />

            {related?.length > 0 && (
              <div className="bl-related" style={{ marginTop: '30px' }}>
                <h4 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px', color: '#0F172A' }}>Related Articles</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {related.map(r => (
                    <Link key={r.slug} to={`/${type}/${r.slug}`} style={{ textDecoration: 'none', color: '#1E293B', display: 'block', padding: '12px', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                      <span style={{ fontSize: '11px', color: '#B51226', fontWeight: 600 }}>{r.category}</span>
                      <h5 style={{ margin: '4px 0 0 0', fontSize: '14px', lineHeight: 1.4 }}>{r.title}</h5>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </section>
    </main>
  );
}
