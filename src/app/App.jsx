import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ThemeProvider } from '@hooks';
import { ROUTES } from '@config/site';
import Loader from './Loader';
import NavigationLoader from './NavigationLoader';
import ScrollToTop from './ScrollToTop';

// Lazy-load pages so each route is a separate chunk
const HomePage = lazy(() => import('@pages/HomePage'));
const BlogPage = lazy(() => import('@pages/BlogPage'));
const NotFoundPage = lazy(() => import('@pages/NotFoundPage'));

export default function App() {
  // Set scroll restoration to manual globally
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  return (
    <HelmetProvider>
      <ThemeProvider>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <ScrollToTop />
          {/* Shows loader on first-load chunk fetches */}
          <Suspense fallback={<Loader />}>
            {/* Shows loader on subsequent navigations between cached pages */}
            <NavigationLoader />
            <Routes>
              <Route path={ROUTES.HOME} element={<HomePage />} />
              <Route path={ROUTES.BLOG} element={<BlogPage />} />
              <Route path={ROUTES.BLOG_POST} element={<BlogPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </ThemeProvider>
    </HelmetProvider>
  );
}
