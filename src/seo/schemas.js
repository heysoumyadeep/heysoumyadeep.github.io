/**
 * schemas.js
 *
 * JSON-LD structured data builders.
 * Used by Google for rich results and by LLMs for semantic understanding.
 *
 * References:
 *  - https://schema.org
 *  - https://developers.google.com/search/docs/appearance/structured-data
 */

import { SITE_CONFIG } from '@config/site';
import { personalInfo } from '@data';
import { KNOWS_ABOUT, getPostKeywords } from './keywords.js';

const BASE_URL = SITE_CONFIG.url;

// ── WebSite ───────────────────────────────────────────────────────────────────
// Goes on every page. Enables Google Sitelinks Searchbox.

export const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_CONFIG.name,
  url: BASE_URL,
  description: `Personal portfolio and blog of ${SITE_CONFIG.name}, Full-Stack Developer at JPMorgan Chase.`,
  author: {
    '@type': 'Person',
    name: SITE_CONFIG.name,
    url: BASE_URL,
  },
};

// ── Person ────────────────────────────────────────────────────────────────────
// Goes on the homepage. Tells Google and LLMs who this site is about.
// NOTE: email is intentionally omitted from JSON-LD — it's publicly crawlable
// and would expose it to scrapers. Use the contact form instead.

export const personSchema = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Soumyadeep Pradhan',
  alternateName: ['Soumya Pradhan', 'Soumya', 'soumyadeep', 'heysoumyadeep'],
  url: BASE_URL,
  image: `${BASE_URL}/og-image.svg`,
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

// ── BreadcrumbList ────────────────────────────────────────────────────────────
// Enables breadcrumb display in Google search results.

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

// ── BlogPosting ───────────────────────────────────────────────────────────────
// Goes on each individual blog post page.
// Most important schema for Google rich results and LLM data sourcing.

export function blogPostingSchema(post) {
  const isoDate = post.date ? new Date(post.date).toISOString() : undefined;

  // Parse readTime safely — "8 min" → 8, "8" → 8, "" → null
  const readMinutes = post.readTime
    ? parseInt(post.readTime, 10) || null
    : null;

  // Estimate word count from readTime (200 wpm standard)
  const wordCount = readMinutes ? readMinutes * 200 : undefined;

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    url: `${BASE_URL}/blog/${post.slug}`,
    datePublished: isoDate,
    dateModified: isoDate,   // update this if you track edits separately
    author: {
      '@type': 'Person',
      name: post.author || SITE_CONFIG.name,
      url: BASE_URL,
    },
    publisher: {
      '@type': 'Person',
      name: SITE_CONFIG.name,
      url: BASE_URL,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${BASE_URL}/blog/${post.slug}`,
    },
    image: {
      '@type': 'ImageObject',
      url: `${BASE_URL}/og-image.svg`,
      width: 1200,
      height: 630,
    },
    keywords: [...(post.tags ?? []), ...getPostKeywords(post.slug)].join(', '),
    articleSection: 'Engineering',
    inLanguage: 'en-US',
    isAccessibleForFree: true,
    // timeRequired: ISO 8601 duration — only set when we have a valid number
    ...(readMinutes ? { timeRequired: `PT${readMinutes}M` } : {}),
    // wordCount helps Google understand content depth
    ...(wordCount ? { wordCount } : {}),
  };
}

// ── Blog (collection) ─────────────────────────────────────────────────────────
// Goes on the /blog index page. Only rendered once posts have loaded.

export function blogSchema(posts) {
  if (!posts?.length) return null; // don't emit empty schema

  return {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: `${SITE_CONFIG.name} - Blog`,
    url: `${BASE_URL}/blog`,
    description: 'Notes on engineering, software craft, and the occasional detour into other things.',
    author: {
      '@type': 'Person',
      name: SITE_CONFIG.name,
      url: BASE_URL,
    },
    blogPost: posts.map((post) => ({
      '@type': 'BlogPosting',
      headline: post.title,
      url: `${BASE_URL}/blog/${post.slug}`,
      datePublished: post.date ? new Date(post.date).toISOString() : undefined,
      description: post.excerpt,
    })),
  };
}

// ── ProfilePage ───────────────────────────────────────────────────────────────
// Signals to Google that this is a profile page for a named person.
// Helps connect partial name searches ("Soumya") to the Knowledge Graph entity.

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
    description: 'Full-Stack Developer (SDE2) at JPMorgan Chase. Creator of CodeScope. Known online as heysoumyadeep.',
    sameAs: [
      personalInfo.social.github,
      personalInfo.social.linkedin,
      personalInfo.social.twitter,
      'https://buymeacoffee.com/heysoumyadeep',
    ],
  },
};

// ── SiteNavigationElement ─────────────────────────────────────────────────────
// Helps Google understand the site structure and navigation hierarchy.

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

