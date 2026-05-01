/**
 * keywords.js
 *
 * Central place for all SEO keywords and topic signals.
 *
 * HOW TO USE:
 *  - Add your name variations, skills, topics, and blog keywords here.
 *  - These are consumed by index.html (via the build plugin), schemas.js,
 *    and per-page SEO components.
 *  - When you write a new blog post, add its specific keywords to POST_KEYWORDS.
 *
 * WHY KEYWORDS STILL MATTER:
 *  - Google ignores <meta name="keywords"> but Bing, DuckDuckGo, and many
 *    AI crawlers still read it.
 *  - More importantly, these keywords feed into JSON-LD schemas (knowsAbout,
 *    keywords fields) which Google DOES use for rich results and Knowledge Graph.
 */

// ── Identity keywords ─────────────────────────────────────────────────────────
// Your name in all likely search variations.

export const IDENTITY_KEYWORDS = [
  'Soumyadeep Pradhan',
  'Soumya Pradhan',
  'Soumya',
  'soumyadeep',
  'heysoumyadeep',
  'soumya.io',
  'Pradhan',
];

// ── Role / professional keywords ──────────────────────────────────────────────
// What you do and where you work.

export const ROLE_KEYWORDS = [
  'Full-Stack Developer',
  'Full Stack Developer',
  'Software Engineer',
  'SDE2',
  'Software Engineer II',
  'JPMorgan Chase',
  'JPMC',
  'software engineer India',
  'developer portfolio',
];

// ── Technical skill keywords ──────────────────────────────────────────────────
// Technologies you work with — match these to your skills.js data.

export const TECH_KEYWORDS = [
  'React',
  'React developer',
  'Node.js',
  'JavaScript',
  'TypeScript',
  'Java',
  'Spring Boot',
  'AWS',
  'Docker',
  'PostgreSQL',
  'Redis',
  'Kafka',
  'Python',
  'REST API',
  'microservices',
  'full stack web development',
];

// ── Project keywords ──────────────────────────────────────────────────────────
// Your notable projects and what they do.

export const PROJECT_KEYWORDS = [
  'CodeScope',
  'AI codebase visualization',
  'codebase visualization tool',
  'AI developer tools',
  'OpenAI API',
  'D3.js',
  'developer tooling',
];

// ── Blog topic keywords ───────────────────────────────────────────────────────
// General topics covered across your blog.

export const BLOG_KEYWORDS = [
  'software engineering blog',
  'engineering career advice',
  'SDE2 lessons',
  'mid-level engineering',
  'software craft',
  'developer growth',
  'code review best practices',
  'scope management',
  'AI in software development',
];

// ── Per-post keywords ─────────────────────────────────────────────────────────
// Specific keywords for each blog post slug.
// Add an entry here whenever you publish a new post.

export const POST_KEYWORDS = {
  'building-codescope': [
    'AI codebase visualization',
    'visualizing codebases with AI',
    'LLM code summarization',
    'dependency graph visualization',
    'CodeScope tool',
    'codebase mental model',
    'OpenAI structured outputs',
    'developer tools AI',
    'code understanding tool',
  ],
  'sde2-lessons': [
    'SDE2 lessons learned',
    'first year SDE2',
    'mid-level engineer tips',
    'software engineer career growth',
    'SDE1 to SDE2 promotion',
    'engineering scope creep',
    'code review teaching',
    'reduce uncertainty engineering',
    'software engineer career advice',
  ],
  'singing-and-software': [
    'hobbies make better engineers',
    'music and software engineering',
    'deliberate practice programming',
    'software craft essay',
    'restraint in code',
    'iteration without ego',
    'classical music software',
    'creative hobbies engineering',
  ],
};

// ── Computed exports ──────────────────────────────────────────────────────────
// Pre-built combinations used by index.html and schemas.

/** All site-level keywords joined for <meta name="keywords"> */
export const SITE_KEYWORDS_STRING = [
  ...IDENTITY_KEYWORDS,
  ...ROLE_KEYWORDS,
  ...TECH_KEYWORDS,
  ...PROJECT_KEYWORDS,
  ...BLOG_KEYWORDS,
].join(', ');

/** All site-level keywords as an array for JSON-LD knowsAbout */
export const KNOWS_ABOUT = [
  'Full-Stack Development',
  'React',
  'Node.js',
  'Java',
  'Spring Boot',
  'AWS',
  'Artificial Intelligence',
  'Developer Tools',
  'Software Architecture',
  'TypeScript',
  'Python',
  'Microservices',
  'System Design',
  'Code Review',
  'Engineering Career Growth',
];

/**
 * Get keywords for a specific blog post slug.
 * Falls back to general blog keywords if no specific entry exists.
 * @param {string} slug
 * @returns {string[]}
 */
export function getPostKeywords(slug) {
  return POST_KEYWORDS[slug] ?? BLOG_KEYWORDS;
}
