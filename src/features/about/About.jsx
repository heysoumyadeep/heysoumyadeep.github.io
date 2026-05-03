import { SectionHeader } from '@components';
import { personalInfo, skills } from '@data';
import SkillPill from './SkillPill';
import './About.scss';

export default function About() {
  return (
    <section id="about" className="section about">
      <div className="container">
        <SectionHeader number="01" label="About" title="A bit about me." />

        <div className="about__grid">
          <div className="about__bio reveal">
            {personalInfo.bio.map((paragraph, i) => (
              <p key={i} className="about__paragraph">{paragraph}</p>
            ))}
            {personalInfo.funFact && (
              <blockquote className="about__funfact">
                <span className="about__funfact-label">Fun fact</span>
                {personalInfo.funFact}
              </blockquote>
            )}
          </div>

          <aside className="about__skills reveal">
            <h3 className="about__skills-title">
              <span className="gradient-text">Tech</span> I reach for
            </h3>
            <p className="about__skills-lede">
              The tools I use day-to-day, and the ones I keep on speed dial.
            </p>
            <ul className="about__skills-list">
              {skills.map((skill, index) => (
                <SkillPill key={skill.name} skill={skill} index={index} />
              ))}
            </ul>
          </aside>
        </div>
      </div>
    </section>
  );
}
