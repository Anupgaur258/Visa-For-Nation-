import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Globe } from '../components/Art.jsx';
import Reveal from '../components/Reveal.jsx';
import SEOHead from '../components/SEOHead.jsx';
import { api, img, adminImg } from '../api.js';
import './About.css';

const reasons = [
  {
    icon: '✦',
    title: 'Expert Guidance',
    text: 'Get professional guidance for your international plans.'
  },
  {
    icon: '◎',
    title: 'Personal Attention',
    text: 'Advice tailored to your profile, needs and goals.'
  },
  {
    icon: '◇',
    title: 'Clear Process',
    text: 'Understand your documents, requirements and next steps.'
  },
  {
    icon: '↗',
    title: 'Ongoing Support',
    text: 'Assistance throughout your application journey.'
  }
];

// Arrange these photos according to the company's actual hierarchy.
// The role order should be verified before publishing.
const teamMembers = [
  { name: 'Ck Sir', image: 'Ck%20Sir.jpg.jpeg', level: 1 },
  { name: 'Simran Kaur', image: 'Simran%20Kaur.jpg.jpeg', level: 2 },

  { name: 'Khushbu', image: 'Khushbu.jpg.jpeg', level: 3 },
  { name: 'Atiya', image: 'Atiya.jpg.jpeg', level: 3 },
  { name: 'Nitesh', image: 'Nitesh.jpg.jpeg', level: 4 },
  { name: 'Khushi', image: 'Khushi.jpg.jpeg', level: 5 },
  { name: 'Salina', image: 'Salina.jpg.jpeg', level: 5 },
  { name: 'Sunaina', image: 'Sunaina.jpg.jpeg', level: 6 },
  { name: 'Taniya', image: 'Taniya.jpg.jpeg', level: 6 },
  { name: 'Umesh', image: 'Umesh.jpg.jpeg', level: 6 }
];

export default function About() {
  const [team, setTeam] = useState(teamMembers);
  useEffect(() => {
    document.title = 'About Us | Visa For Nation';
    api('/team-images').then(items => { if (Array.isArray(items) && items.length) setTeam(items.map((item, index) => ({ name: item.altText || 'Team member ' + (index + 1), image: item.imageUrl, level: index + 1 }))); }).catch(() => {});
  }, []);

  return (
    <main className="ab">
      <SEOHead
        title="About Us | Visa For Nation"
        description="Learn about Visa For Nation, our team, our mission and our approach to immigration and visa consultancy."
      />

      {/* HERO */}
      <section className="ab-sec ab-hero">
        <div className="ab-wrap ab-hero-grid">
          <Reveal from="left" className="ab-hero-text">
            <span className="ab-eyebrow">ABOUT VISA FOR NATION</span>

            <h1 className="ab-h2">
              Your Global Journey,
              <br />
              <em>Our Guidance.</em>
            </h1>

            <p className="ab-lead">
              We help individuals, students, professionals and families
              explore international opportunities with clear guidance
              and professional support.
            </p>

            <Link to="/contact-us" className="ab-btn red">
              Talk To Our Team <span>→</span>
            </Link>
          </Reveal>

          <Reveal from="right" delay={100} className="ab-hero-art">
            <div className="ab-globe-wrap">
              <div className="ab-globe">
                <Globe />
              </div>
              <span className="ab-globe-tag">
                Your Journey Starts Here
              </span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* WHO WE ARE */}
      <section className="ab-sec">
        <div className="ab-wrap ab-intro">
          <Reveal from="left" className="ab-intro-visual">
            <div className="ab-visual-main">
              <img
                src="/assets/brand/logo-white.svg"
                alt="Visa For Nation logo"
              />
              <span>YOUR DREAMS. OUR GUIDANCE.</span>
            </div>

            <div className="ab-visual-card">
              <span className="ab-small-label">OUR COMMITMENT</span>
              <h3>
                Guidance you can understand. Support you can trust.
              </h3>
            </div>
          </Reveal>

          <Reveal from="right" delay={100} className="ab-intro-copy">
            <span className="ab-eyebrow">WHO WE ARE</span>

            <h2 className="ab-h2">
              Helping You Explore
              <br />
              <em>Global Opportunities.</em>
            </h2>

            <p>
              Visa For Nation is an immigration and visa consultancy
              helping people understand their options for studying,
              working, travelling and settling abroad.
            </p>

            <p>
              We guide clients through relevant requirements,
              documentation and application preparation based on
              their individual circumstances.
            </p>

            <p>
              Our focus is simple: clear communication, careful
              preparation and support at every stage of the journey.
            </p>
          </Reveal>
        </div>
      </section>

      {/* VISION AND MISSION */}
      <section className="ab-sec ab-soft">
        <div className="ab-wrap">
          <Reveal from="up">
            <div className="ab-head">
              <span className="ab-eyebrow">OUR PURPOSE</span>
              <h2 className="ab-h2">
                What We Stand <em>For.</em>
              </h2>
              <p className="ab-sub">
                A clear purpose and a client-focused approach guide
                the way we work.
              </p>
            </div>
          </Reveal>

          <div className="ab-purpose">
            <Reveal from="up">
              <article className="ab-purpose-card">
                <span className="ab-card-label">OUR VISION</span>
                <h3>Connecting People With Possibilities</h3>
                <p>
                  To be a trusted consultancy that helps people
                  explore international opportunities through
                  responsible and informed guidance.
                </p>
              </article>
            </Reveal>

            <Reveal from="up" delay={100}>
              <article className="ab-purpose-card featured">
                <span className="ab-card-label">OUR MISSION</span>
                <h3>Making The Process Clearer</h3>
                <p>
                  To simplify the visa journey through personalised
                  guidance, transparent communication and careful
                  application preparation.
                </p>
              </article>
            </Reveal>
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className="ab-sec">
        <div className="ab-wrap">
          <Reveal from="up">
            <div className="ab-head">
              <span className="ab-eyebrow">WHY VISA FOR NATION</span>
              <h2 className="ab-h2">
                Support That Puts <em>You First.</em>
              </h2>
              <p className="ab-sub">
                Practical guidance and personal attention throughout
                your application journey.
              </p>
            </div>
          </Reveal>

          <div className="ab-reasons">
            {reasons.map((reason, index) => (
              <Reveal key={reason.title} from="up" delay={index * 70}>
                <article className="ab-reason-card">
                  <div className="ab-reason-icon">{reason.icon}</div>
                  <h3>{reason.title}</h3>
                  <p>{reason.text}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* OUR TEAM Section  */}
      <section className="ab-sec ab-soft ab-team-section">
        <div className="ab-wrap">
          <Reveal from="up">
            <div className="ab-head">
              <span className="ab-eyebrow">OUR PEOPLE</span>
              <h2 className="ab-h2">
                Meet The <em>Team.</em>
              </h2>
              <p className="ab-sub">
                The people working together behind Visa For Nation.
              </p>
            </div>
          </Reveal>

          <div className="ab-team-grid">
            {team.map((member, index) => (
              <Reveal
                key={member.name}
                from="up"
                delay={(index % 4) * 60}
                className="ab-team-reveal"
              >
                <article className="ab-team-card">
                  <img
                    className="ab-team-photo"
                    src={member.image?.startsWith('uploads/') || member.image?.startsWith('http') ? adminImg(member.image) : img(`uploads/team/${decodeURIComponent(member.image)}`)}
                    alt={`Visa For Nation team member ${index + 1}`}
                    loading="lazy"
                  />
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT CTA  section */}
      <section className="ab-sec ab-cta">
        <div className="ab-wrap ab-cta-content">
          <Reveal from="up">
            <span className="ab-eyebrow">LET'S GET STARTED</span>

            <h2 className="ab-h2">
              Ready For Your
              <br />
              <em>Next Chapter?</em>
            </h2>

            <p>
              Talk to our team to explore your options and understand
              the next steps for your international plans.
            </p>

            <Link to="/contact-us" className="ab-cta-btn">
              Contact Us <span>→</span>
            </Link>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
