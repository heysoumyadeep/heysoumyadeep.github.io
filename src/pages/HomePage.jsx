import { Navbar, Footer, ParallaxBackground, SupportSnackbar } from '@components';
import { useScrollReveal } from '@hooks';
import SEO from '@/seo/SEO';
import { websiteSchema, personSchema, profilePageSchema, siteNavigationSchema } from '@/seo/schemas';
import Hero from '@features/hero';
import About from '@features/about';
import Experience from '@features/experience';
import Projects from '@features/projects';
import Writing from '@features/writing';
import Contact from '@features/contact';
import { personalInfo } from '@data';

export default function HomePage() {
  useScrollReveal();

  return (
    <>
      <SEO
        description="Soumyadeep Pradhan (Soumya) - Full-Stack Developer (SDE2) at JPMorgan Chase. Creator of CodeScope, an AI-powered codebase visualization tool. Building thoughtful software with React, Node.js, Java, Spring Boot, and AWS. Based in India."
        canonical="/"
        schema={[websiteSchema, personSchema, profilePageSchema, siteNavigationSchema]}
      />
      <ParallaxBackground />
      <Navbar />
      <main>
        <Hero />
        <About />
        <Experience />
        <Projects />
        <Writing />
        <Contact />
      </main>
      <Footer />
      <SupportSnackbar />
    </>
  );
}
