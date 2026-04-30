import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ThemeProvider } from '@hooks';
import { ROUTES } from '@config/site';

// Lazy-load pages so each route is a separate chunk
const HomePage = lazy(() => import('@pages/HomePage'));
const BlogPage = lazy(() => import('@pages/BlogPage'));

export default function App() {
  return (
    <HelmetProvider>
      <ThemeProvider>
        <BrowserRouter>
          <Suspense fallback={null}>
            <Routes>
              <Route path={ROUTES.HOME} element={<HomePage />} />
              <Route path={ROUTES.BLOG} element={<BlogPage />} />
              <Route path={ROUTES.BLOG_POST} element={<BlogPage />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </ThemeProvider>
    </HelmetProvider>
  );
}
