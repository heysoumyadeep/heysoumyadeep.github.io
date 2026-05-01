import { Button } from '@components';
import { personalInfo } from '@data';
import './Hero.scss';

export default function Hero() {
  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="home" className="hero">
      <div className="container">
        <p className="hero__greeting reveal">Hey there, I'm</p>

        <h1 className="hero__name reveal">
          <span className="gradient-text">{personalInfo.name}</span>
          <span className="hero__dot">.</span>
        </h1>

        <p className="hero__tagline reveal">
          <span className="mono hero__tagline-label">Role -</span>{' '}
          <strong>{personalInfo.role}</strong>{' '}
          <span className="hero__tagline-divider">·</span>{' '}
          {personalInfo.tagline}
        </p>

        <div className="hero__cta reveal">
          <Button variant="primary" onClick={() => scrollTo('projects')}>
            See my work →
          </Button>
          <Button variant="ghost" onClick={() => scrollTo('contact')}>
            Get in touch
          </Button>
        </div>
      </div>
    </section>
  );
}
