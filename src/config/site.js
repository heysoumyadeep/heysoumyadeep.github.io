/**
 * Site-wide configuration constants.
 */

export const SITE_CONFIG = {
  name: 'Soumyadeep Pradhan',
  shortName: 'Soumyadeep',
  email: 'hello@soumyadeep.dev',
  url: 'https://soumya.io',
};

export const NAV_ITEMS = [
  { label: 'Home', href: '#home', type: 'anchor' },
  { label: 'About', href: '#about', type: 'anchor' },
  { label: 'Experience', href: '#experience', type: 'anchor' },
  { label: 'Projects', href: '#projects', type: 'anchor' },
  { label: 'Blog', href: '/blog', type: 'route' },
  { label: 'Contact', href: '#contact', type: 'anchor' },
];

export const ROUTES = {
  HOME: '/',
  BLOG: '/blog',
  BLOG_POST: '/blog/:slug',
};
