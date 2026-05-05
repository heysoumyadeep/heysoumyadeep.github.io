// JSON-LD structured data builders

import { SITE_CONFIG } from '@config/site';
import { personalInfo } from '@data';
import { KNOWS_ABOUT, getPostKeywords } from './keywords.js';

const BASE_URL = SITE_CONFIG.url;

// WebSite — every page
export const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_CONFIG.name,
  url: BASE_URL,
  description: `Personal portfolio and blog of ${SITE_CONFIG.name}, Full-Stack Developer at JPMorgan Chase.`,
  author: { '@type': 'Person', name: SITE_CONFIG.name, url: BASE_URL },
};

// Person — homepage
export const personSchema = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Soumyadeep Pradhan',
  alternateName: ['Soumya Pradhan', 'Soumya', 'soumyadeep', 'heysoumyadeep'],
  url: BASE_URL,
  image: `${BASE_URL}/og-image.png`,
  jobTitle: personalInfo.role,
  worksFor: {
    '@type': 'Organization',
    name: 'JPMorgan Chase',
    url: 'https://www.jpmorganchase.com',
  },
  description: personalInfo.bio[0],
  sameAs: [
    personalInfo.social.github,
    personalInfo.social.linkedin,
    personalInfo.social.twitter,
    'https://buymeacoffee.com/heysoumyadeep',
    BASE_URL,
  ],
  knowsAbout: KNOWS_ABOUT,
};

// BreadcrumbList
export function breadcrumbSchema(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

// BlogPosting — individual post page
export function blogPostingSchema(post) {
  const isoDate    = post.date ? new Date(post.date).toISOString() : undefined;
  const readMinutes = post.readTime ? parseInt(post.readTime, 10) || null : null;
  const wordCount   = readMinutes ? readMinutes * 200 : undefined;

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    url: `${BASE_URL}/blog/${post.slug}`,
    datePublished: isoDate,
    dateModified: isoDate,
    author: { '@type': 'Person', name: post.author || SITE_CONFIG.name, url: BASE_URL },
    publisher: { '@type': 'Person', name: SITE_CONFIG.name, url: BASE_URL },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${BASE_URL}/blog/${post.slug}` },
    image: { '@type': 'ImageObject', url: `${BASE_URL}/og-images/${post.slug}.png`, width: 1200, height: 630 },
    keywords: [...(post.tags ?? []), ...getPostKeywords(post.slug)].join(', '),
    articleSection: 'Engineering',
    inLanguage: 'en-US',
    isAccessibleForFree: true,
    ...(readMinutes ? { timeRequired: `PT${readMinutes}M` } : {}),
    ...(wordCount   ? { wordCount } : {}),
  };
}

// Blog collection — /blog index
export function blogSchema(posts) {
  if (!posts?.length) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: `${SITE_CONFIG.name} - Blog`,
    url: `${BASE_URL}/blog`,
    description: 'Notes on engineering, software craft, and the occasional detour into other things.',
    author: { '@type': 'Person', name: SITE_CONFIG.name, url: BASE_URL },
    blogPost: posts.map((post) => ({
      '@type': 'BlogPosting',
      headline: post.title,
      url: `${BASE_URL}/blog/${post.slug}`,
      datePublished: post.date ? new Date(post.date).toISOString() : undefined,
      description: post.excerpt,
    })),
  };
}

// ProfilePage — homepage
export const profilePageSchema = {
  '@context': 'https://schema.org',
  '@type': 'ProfilePage',
  dateCreated: '2024-01-01T00:00:00Z',
  dateModified: new Date().toISOString(),
  mainEntity: {
    '@type': 'Person',
    name: 'Soumyadeep Pradhan',
    alternateName: ['Soumya Pradhan', 'Soumya', 'soumyadeep', 'heysoumyadeep'],
    url: BASE_URL,
    jobTitle: 'Full-Stack Developer',
    description: 'Full-Stack Developer (SDE2) at JPMorgan Chase. Known online as heysoumyadeep.',
    sameAs: [
      personalInfo.social.github,
      personalInfo.social.linkedin,
      personalInfo.social.twitter,
      'https://buymeacoffee.com/heysoumyadeep',
    ],
  },
};

// SiteNavigationElement
export const siteNavigationSchema = {
  '@context': 'https://schema.org',
  '@type': 'SiteNavigationElement',
  name: ['Home', 'About', 'Experience', 'Projects', 'Blog', 'Contact'],
  url: [
    `${BASE_URL}/#home`,
    `${BASE_URL}/#about`,
    `${BASE_URL}/#experience`,
    `${BASE_URL}/#projects`,
    `${BASE_URL}/blog`,
    `${BASE_URL}/#contact`,
  ],
};
