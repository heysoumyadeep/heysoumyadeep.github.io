import { SectionHeader } from '@components';
import { projects } from '@data';
import ProjectCard from './ProjectCard';
import './Projects.scss';

export default function Projects() {
  const featured = projects.filter((p) => p.featured);
  const others = projects.filter((p) => !p.featured);

  return (
    <section id="projects" className="section projects">
      <div className="container">
        <SectionHeader number="03" label="Projects" title="Things I've built." />

        <div className="projects__featured reveal">
          {featured.map((project) => (
            <ProjectCard key={project.id} project={project} featured />
          ))}
        </div>

        {others.length > 0 && (
          <div className="projects__grid reveal">
            {others.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
