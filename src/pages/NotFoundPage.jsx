import { Link } from 'react-router-dom';
import { Navbar, Footer, ParallaxBackground } from '@components';
import SEO from '@/seo/SEO';
import './NotFoundPage.scss';

export default function NotFoundPage() {
  return (
    <>
      <SEO
        title="Page not found"
        description="The page you're looking for doesn't exist."
        canonical="/404"
      />
      <ParallaxBackground />
      <Navbar />
      <main className="not-found">
        <div className="not-found__inner container">
          <p className="not-found__code mono">404</p>
          <h1 className="not-found__title">Nothing here.</h1>
          <p className="not-found__lede">
            That page doesn't exist — it may have moved, or the URL might be off.
          </p>
          <Link to="/" className="not-found__btn">
            Back to home →
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
