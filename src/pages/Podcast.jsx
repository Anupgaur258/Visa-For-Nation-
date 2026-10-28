import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { adminImg } from '../api.js';
import { getPodcastEmbed } from './podcastUtils.js';
import './Podcast.css';

export default function Podcast() {
  const [episodes, setEpisodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    api('/podcasts').then(setEpisodes).catch(err => setError(err.message || 'Podcasts are temporarily unavailable.')).finally(() => setLoading(false));
  }, []);
  return <section className="podcast-page">
    <div className="podcast-hero"><span className="podcast-eyebrow">VISA FOR NATION</span><h1>Podcast <em>&amp; conversations</em></h1><p>Listen to practical conversations and guidance for your next global move.</p></div>
    <div className="podcast-list" aria-live="polite">
      {loading && <p className="podcast-state">Loading episodes…</p>}
      {!loading && error && <p className="podcast-state error">{error}</p>}
      {!loading && !error && episodes.length === 0 && <p className="podcast-state">New episodes are coming soon.</p>}
      {episodes.map(episode => {
        const embed = getPodcastEmbed(episode.url);
        return <article className="podcast-card" key={episode._id || episode.url}>
          {episode.thumbnailUrl && <img className="podcast-thumbnail" src={adminImg(episode.thumbnailUrl)} alt={`${episode.title} thumbnail`} loading="lazy" />}
          <div className="podcast-card-heading"><span className="podcast-mark" aria-hidden="true">VFN</span><div><h2>{episode.title}</h2><p>Visa For Nation podcast</p></div></div>
          {embed ? <iframe title={`Play ${episode.title}`} src={embed} loading="lazy" sandbox="allow-scripts allow-same-origin allow-presentation" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" referrerPolicy="strict-origin-when-cross-origin" /> : <p className="podcast-state error">This episode link is currently unavailable.</p>}
        </article>;
      })}
    </div>
  </section>;
}
