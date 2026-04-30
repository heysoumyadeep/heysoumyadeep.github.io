import { GithubIcon, ExternalLinkIcon } from '@components';
import './ProjectCard.scss';

export default function ProjectCard({ project, featured = false }) {
  return (
    <article className={`project-card ${featured ? 'project-card--featured' : ''}`}>
      <div className="project-card__top">
        <div className="project-card__icon" aria-hidden="true">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
          </svg>
        </div>

        <div className="project-card__links">
          {project.github && (
            <a href={project.github} target="_blank" rel="noreferrer"
               aria-label={`${project.title} source`}>
              <GithubIcon size={18} />
            </a>
          )}
          {project.link && (
            <a href={project.link} target="_blank" rel="noreferrer"
               aria-label={`${project.title} live demo`}>
              <ExternalLinkIcon size={18} />
            </a>
          )}
        </div>
      </div>

      <h3 className="project-card__title">{project.title}</h3>
      <p className="project-card__description">{project.description}</p>

      <ul className="project-card__stack">
        {project.stack.map((tech) => (
          <li key={tech} className="mono">{tech}</li>
        ))}
      </ul>
    </article>
  );
}
