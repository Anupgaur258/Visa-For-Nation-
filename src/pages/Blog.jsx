import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, img, adminImg } from '../api.js';
import { FALLBACK_POSTS } from '../data/postsData.js';
import Loader from '../components/Loader.jsx';
import Reveal from '../components/Reveal.jsx';
import SEOHead from '../components/SEOHead.jsx';
import EnquiryForm from '../components/EnquiryForm.jsx';
import './Blog.css';

const pic = p => (p?.startsWith('uploads/') && /^\d{10}_/.test(p.split('/')[1]) ? img(p) : adminImg(p) || img(p));
const handleImageError = (event, source) => {
  const image = event.currentTarget;
  if (!image.dataset.localFallback) {
    image.dataset.localFallback = 'true';
    image.src = img(source);
  } else {
    image.onerror = null;
    image.src = '/logo.png';
  }
};
const date = d => new Date(d || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

const Card = ({ p, i }) => (
  <Reveal from={['left', 'up', 'right'][i % 3]} delay={i * 80} as={Link} to={`/blog/${p.slug}`} className="bl-card">
    <div className="bl-card-img">
      <img src={pic(p.image)} alt={p.title} loading="lazy" onError={e => handleImageError(e, p.image)} />
    </div>
    <div className="bl-card-body">
      <div className="bl-card-meta">
        <span>{p.category}</span>
        <span className="bl-dot" aria-hidden="true" />
        <time>{date(p.createdAt)}</time>
      </div>
      <h3>{p.title}</h3>
      <p>{p.metaDescription}</p>
      <div className="bl-card-footer">
        <span>Read article</span>
        <i aria-hidden="true">→</i>
      </div>
    </div>
  </Reveal>
);

export function Blog() {
  const [posts, setPosts] = useState(FALLBACK_POSTS);

  useEffect(() => {
    document.title = 'Immigration Blog & Visa Guides | Visa For Nation';
    api('/posts')
      .then(p => {
        if (Array.isArray(p) && p.length > 0) setPosts(p);
      })
      .catch(() => {});
  }, []);

  return (
    <main className="bl">
      <SEOHead
        title="Immigration Blog & Visa Insights | Visa For Nation"
        description="Latest guides, news and expert insights on Canada PR, Australia PR, Study Visas, Work Permits, and Tourist Visas from Visa For Nation."
      />

      <section className="bl-sec bl-hero">
        <div className="bl-wrap">
          <Reveal from="up">
            <div className="bl-head">
              <span className="bl-eyebrow">Our Blog</span>
              <h2 className="bl-h2">Immigration <em>Insights</em></h2>
              <p className="bl-lead">Guides, updates and expert advice on PR, work and study visas.</p>
            </div>
          </Reveal>

          <Reveal from="up" delay={100}>
            {!posts ? <Loader /> : <>
              {posts[0] && <Link to={'/blog/' + posts[0].slug} className="bl-featured">
                <div className="bl-featured-img"><img src={pic(posts[0].image)} alt={posts[0].title} onError={e => handleImageError(e, posts[0].image)} /></div>
                <div className="bl-featured-copy"><span className="bl-eyebrow">Latest article</span><h2>{posts[0].title}</h2><p>{posts[0].metaDescription || posts[0].content?.replace(/<[^>]*>/g, '').slice(0, 180)}</p><span className="bl-card-footer">Read more</span></div>
              </Link>}
              <div className="bl-grid">{posts.slice(1).map((p, i) => <Card key={p._id || p.slug} p={p} i={i} />)}</div>
            </>}
          </Reveal>
        </div>
      </section>
    </main>
  );
}

export function BlogPost() {
  const { slug } = useParams();
  const fallback = FALLBACK_POSTS.find(p => p.slug === slug);
  const [d, setD] = useState(fallback ? { post: fallback, related: FALLBACK_POSTS.filter(p => p.slug !== slug).slice(0, 3) } : null);

  useEffect(() => {
    api(`/posts/${slug}`)
      .then(x => {
        setD(x);
      })
      .catch(() => {
        if (!fallback) setD(false);
      });
  }, [slug, fallback]);

  if (d === false) return (
    <main className="bl">
      <section className="bl-sec bl-hero">
        <div className="bl-wrap">
          <Reveal from="up">
            <div className="bl-notfound" style={{ textAlign: 'center', padding: '60px 20px' }}>
              <h1 style={{ fontSize: '72px', color: '#B51226', margin: '0 0 16px 0' }}>404</h1>
              <p style={{ fontSize: '18px', color: '#64748B', marginBottom: '24px' }}>Post not found.</p>
              <Link className="bl-btn red btn btn-red" to="/blog">Back to blog</Link>
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
    <main className="bl">
      <SEOHead
        title={post.metaTitle || post.title}
        description={post.metaDescription}
      />

      <section className="bl-sec bl-post-hero">
        <div className="bl-wrap">
          <Reveal from="up">
            <span className="bl-eyebrow">{post.category}</span>
            <h2 className="bl-h2">{post.title}</h2>
            <div className="bl-post-meta">
              <time>{date(post.createdAt)}</time>
              <span className="bl-dot" aria-hidden="true" />
              <span>{post.views || 1} views</span>
            </div>
          </Reveal>
        </div>
      </section>

{/* another section for blog image  */}
      <section className="bl-sec">
        <div className="bl-wrap bl-post-grid">
          <div className="bl-post-main">
            {post.image && (
              <div className="bl-post-cover" style={{ marginBottom: '24px', borderRadius: '12px', overflow: 'hidden' }}>
                <img src={pic(post.image)} alt={post.title} style={{ width: '100%', maxHeight: '420px', objectFit: 'cover' }} onError={e => handleImageError(e, post.image)} />
              </div>
            )}
            <div className="bl-prose" dangerouslySetInnerHTML={{ __html: post.content }} />
            {related?.length > 0 && <section className="bl-next-articles"><h3>Continue reading</h3><div className="bl-grid">{related.map((item, index) => <Card key={item._id || item.slug} p={item} i={index} />)}</div></section>}
          </div>

          <aside className="bl-post-sidebar">
            <EnquiryForm variant="card" title="Ask an Immigration Expert" sub="Free profile evaluation for PR, Study or Work" />

            {related?.length > 0 && (
              <div className="bl-related" style={{ marginTop: '30px' }}>
                <h4 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px', color: '#0F172A' }}>Related Articles</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {related.map(r => (
                    <Link key={r.slug} to={`/blog/${r.slug}`} style={{ textDecoration: 'none', color: '#1E293B', display: 'block', padding: '12px', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
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
 


// // about page 
// <div>  
//   <h2>
//     About Us </h2> 
//     <p> about page title  </p>
//     <p> about page description</p>
//     <p> about page content </p>
//     <div> 
//       {/* banner img   */}
//       <banner>
//         <img src={} alt= "about page banner img"/>
    
//       </banner>
//       {/* card image  */}

//       <div>  
//         <img src={} alt= "about page img"/>
//       </div>
    
//     </div>

//     </div>