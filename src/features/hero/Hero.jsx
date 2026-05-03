import { Link } from 'react-router-dom';
import { Button } from '@components';
import { personalInfo } from '@data';
import './Hero.scss';

export default function Hero() {
  return (
    <section id="home" className="hero">
      <div className="container">
        <p className="hero__greeting reveal">Hey there, I'm</p>

        <h1 className="hero__name reveal">
          <span className="gradient-text">{personalInfo.name}</span>
          <span className="hero__dot">.</span>
        </h1>

        <p className="hero__tagline reveal">
          <strong>{personalInfo.role}</strong>{' '}
          {personalInfo.tagline}
        </p>

        <div className="hero__cta reveal">
          <Button
            variant="primary"
            as="a"
            href="https://topmate.io/heysoumyadeep/2055573"
            target="_blank"
            rel="noopener noreferrer"
          >
            Book a 1:1{' '}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              style={{ display: 'inline', verticalAlign: 'middle', marginLeft: '4px' }}
            >
              <line x1="7" y1="17" x2="17" y2="7" />
              <polyline points="7 7 17 7 17 17" />
            </svg>
          </Button>
          <Button variant="ghost" as={Link} to="/blog">
            See my blogs
          </Button>
        </div>
      </div>
    </section>
  );
}
