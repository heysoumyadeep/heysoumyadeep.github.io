import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Navbar, Footer, ParallaxBackground, SupportSnackbar } from '@components';
import { useScrollReveal } from '@hooks';
import BlogIndex from '@features/blog/BlogIndex.jsx';
import BlogPostDetail from '@features/blog/BlogPostDetail.jsx';

export default function BlogPage() {
  useScrollReveal();
  const { slug } = useParams();

  // Scroll to top on route change
  useEffect(() => { window.scrollTo(0, 0); }, [slug]);

  return (
    <>
      <ParallaxBackground />
      <Navbar />
      {slug ? <BlogPostDetail slug={slug} /> : <BlogIndex />}
      <Footer />
      <SupportSnackbar />
    </>
  );
}
