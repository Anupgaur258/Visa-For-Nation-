import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, img, adminImg } from '../api.js';
import Loader from '../components/Loader.jsx';
import Reveal from '../components/Reveal.jsx';
import EnquiryForm from '../components/EnquiryForm.jsx';

const pic = p => (p?.startsWith('uploads/') && /^\d{10}_/.test(p.split('/')[1]) ? img(p) : adminImg(p) || img(p));
const date = d => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
const Card = ({ p, i }) => (
  <Reveal from={['left', 'up', 'right'][i % 3]} delay={i * 80} as={Link} to={`/blog/${p.slug}`} className="bcard">
    <img src={pic(p.image)} alt={p.title} loading="lazy" onError={e => (e.target.src = img(p.image))} />
    <div><small>{p.category} · {date(p.createdAt)}</small><h3>{p.title}</h3><p>{p.metaDescription}</p><span>Read article →</span></div>
  </Reveal>
);

export function Blog() {
  const [posts, setPosts] = useState(null);
  useEffect(() => { document.title = 'Blog | Visa For Nation'; api('/posts').then(setPosts); }, []);
  return (
    <>
      <section className="page-hero"><div className="wrap"><div className="ph-text"><span className="badge">Our Blog</span><h1>Immigration <em>Insights</em></h1><p>Guides, updates and expert advice on PR, work and study visas.</p></div></div></section>
      <div className="wrap blog-grid">{!posts ? <Loader /> : posts.map((p, i) => <Card key={p._id} p={p} i={i} />)}</div>
    </>
  );
}

export function BlogPost() {
  const { slug } = useParams();
  const [d, setD] = useState(null);
  useEffect(() => { setD(null); api(`/posts/${slug}`).then(x => { setD(x); document.title = x.post.metaTitle || x.post.title; }).catch(() => setD(false)); }, [slug]);
  if (d === false) return <div className="notfound"><h1>404</h1><p>Post not found.</p><Link className="btn btn-red" to="/blog">Back to blog</Link></div>;
  if (!d) return <Loader />;
  const { post, related } = d;
  return (
    <>
      <section className="page-hero"><div className="wrap"><div className="ph-text"><span className="badge">{post.category}</span><h1>{post.title}</h1><p>{date(post.createdAt)} · {post.views} views</p></div></div></section>
      <div className="wrap page-grid">
        <Reveal as="article" from="left" className="content-wrap"><img className="post-img" src={pic(post.image)} alt={post.title} onError={e => (e.target.src = img(post.image))} /><div className="prose" dangerouslySetInnerHTML={{ __html: post.content }} /></Reveal>
        <div className="side"><Reveal from="right"><EnquiryForm /></Reveal></div>
      </div>
      {related.length > 0 && <div className="wrap"><h2 className="center-h">More Articles</h2><div className="blog-grid">{related.map((p, i) => <Card key={p._id} p={p} i={i} />)}</div></div>}
    </>
  );
}
