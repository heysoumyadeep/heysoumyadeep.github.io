# Soumyadeep Pradhan — Portfolio

Personal portfolio and blog built with React, Vite, MDX, and SCSS.

## Features

- Single-page portfolio with smooth section scrolling
- Blog powered by MDX — write posts in Markdown, render as React components
- Light / dark mode with flash-free theme persistence
- Parallax background with mouse-tracking orbs
- Animated skill pills, tabbed experience section, working contact form
- Full SEO: JSON-LD schemas, Open Graph, Twitter Card, sitemap, RSS feed, llms.txt
- Module Federation — blog system exposed as a remote module
- Two-tier blog loading: metadata eager, post bodies lazy per-post

## Getting started

```bash
npm install
npm start          # dev server at http://localhost:3000
npm run build      # production build → dist/
npm run preview    # preview the production build
```

## Project structure

```
src/
├── app/                  # App root, routing, providers
├── config/               # Site constants, nav items, routes
├── data/                 # Content files (edit these to update the site)
│   ├── personal.js       # Name, bio, email, social links
│   ├── skills.js         # Tech stack pills
│   ├── experience.js     # Work history
│   ├── projects.js       # Projects
│   └── blog/posts/       # MDX blog posts
├── features/             # Self-contained page sections
│   ├── hero/
│   ├── about/
│   ├── experience/
│   ├── projects/
│   ├── writing/
│   ├── contact/
│   └── blog/             # Blog index, post detail, repository, view tracker
├── hooks/                # useTheme, useScrollReveal
├── pages/                # Route-level pages (HomePage, BlogPage)
├── seo/                  # SEO component, JSON-LD schemas, keywords
├── site-container/       # Shared UI components (Navbar, Footer, Button, etc.)
└── styles/
    ├── tokens.css        # Design tokens — single source of truth for all colors/spacing
    └── global.css        # Reset, base styles, theme transitions, scrollbar, cursor glow
```

## Writing a blog post

1. Create `src/data/blog/posts/your-post-slug.mdx`
2. Add a frontmatter export at the top:

```mdx
export const frontmatter = {
  title: "Your Post Title",
  date: "Jan 01, 2026",
  readTime: "5 min",
  excerpt: "A short description under 160 characters.",
  author: "Soumyadeep Pradhan",
  tags: ["tag1", "tag2"]
}

export const faqs = [
  { question: "...", answer: "..." }
]

# Your post content here...
```

3. Add post-specific keywords to `src/seo/keywords.js` under `POST_KEYWORDS`
4. Run `npm run build` — the sitemap, prerender routes, and RSS feed update automatically

## Updating content

All content lives in `src/data/`. No component changes needed:

- `personal.js` — name, bio, email, social links
- `skills.js` — tech stack (with brand colors)
- `experience.js` — work history tabs
- `projects.js` — featured and secondary projects

## Wiring up the contact form

Replace the `setTimeout` in `src/features/contact/ContactForm.jsx` with a real request:

```js
// Formspree
await fetch('https://formspree.io/f/YOUR_ID', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(values),
});
```

## Deploying to Hostinger / AWS

Build command: `npm run build`  
Output directory: `dist/`

The `dist/` folder is a fully static site. Upload it to any static host.

**Important for SPA routing:** Configure your server to serve `index.html` for all routes.

- **Hostinger**: In the File Manager, add an `.htaccess` file to `public_html/`:
  ```apache
  Options -MultiViews
  RewriteEngine On
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteRule ^ index.html [QSA,L]
  ```
- **AWS S3 + CloudFront**: Set the error page to `index.html` with HTTP 200.
- **AWS Amplify**: Add a rewrite rule: source `</^[^.]+$|\.(?!(css|gif|ico|jpg|js|png|txt|svg|woff|woff2|ttf|map|json)$)([^.]+$)/>`, target `/index.html`, type `200`.

## After deploying

1. Submit `https://soumya.io/sitemap.xml` to [Google Search Console](https://search.google.com/search-console)
2. Request indexing for each URL in Search Console
3. Submit to [Bing Webmaster Tools](https://www.bing.com/webmasters)

## License

MIT
