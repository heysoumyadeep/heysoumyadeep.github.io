# Soumyadeep Pradhan — Portfolio

Personal portfolio and blog built with React, Vite, MDX, and SCSS.

---

## Features

- Single-page portfolio with smooth section scrolling
- Blog powered by MDX — write posts in Markdown, rendered as React components
- Light / dark mode with flash-free theme persistence
- Parallax background with mouse-tracking orbs
- Animated skill pills, tabbed experience section, working contact form
- Full SEO: JSON-LD schemas, Open Graph, Twitter Card, sitemap, RSS feed, llms.txt
- Module Federation — blog system exposed as a remote module
- Two-tier blog loading: metadata eager, post bodies lazy per-post

---

## Tech Stack

| Layer | Technology |
|---|---|
| UI Framework | React 18 |
| Build Tool | Vite 5 |
| Language | JavaScript (ESM) + TypeScript |
| Styling | SCSS (Sass modern compiler) |
| Blog / Content | MDX 3 (`@mdx-js/rollup`, `@mdx-js/react`) |
| Routing | React Router DOM v6 |
| SEO | React Helmet Async, JSON-LD, Open Graph, Twitter Card |
| Module Federation | `vite-plugin-federation` |
| Static Generation | Custom Vite plugins (sitemap, prerender) |

---

## Key Concepts

- **Module Federation** — the blog feature is exposed as a remote module (`remoteEntry.js`) via `vite-plugin-federation`, allowing it to be consumed independently by other apps
- **Two-tier blog loading** — post metadata is loaded eagerly for listing; post body MDX is loaded lazily per-post to keep initial bundle small
- **Flash-free theming** — theme is persisted to `localStorage` and applied before React hydrates, preventing a flash of wrong theme on load
- **Path aliases** — `@`, `@app`, `@components`, `@features`, `@hooks`, `@pages`, `@styles`, `@data` configured in `vite.config.js` for clean imports
- **Static SPA** — prerender plugin generates static HTML shells for each route at build time; sitemap plugin auto-generates `sitemap.xml` and RSS feed
- **Design tokens** — all colors, spacing, and typography live in `src/styles/tokens.css` as CSS custom properties, consumed across all SCSS files

---

## Project Structure

```
├── public/               # Static assets (favicon, robots.txt, manifest, RSS, redirects)
├── scripts/
│   ├── vite-plugin-prerender.js   # Generates static HTML per route at build time
│   └── vite-plugin-sitemap.js     # Auto-generates sitemap.xml + RSS feed
└── src/
    ├── app/
    │   ├── App.jsx               # Root component, router, providers
    │   └── main.jsx              # React DOM entry point
    ├── config/
    │   └── site.js               # Site constants, nav items, route definitions
    ├── data/                     # All content lives here — edit to update the site
    │   ├── personal.js           # Name, bio, email, social links
    │   ├── skills.js             # Tech stack pills (name + brand color)
    │   ├── experience.js         # Work history tabs
    │   ├── projects.js           # Featured and secondary projects
    │   ├── index.js              # Re-exports all data
    │   └── blog/
    │       └── posts/            # MDX blog posts (one file per post)
    ├── features/                 # Self-contained page sections
    │   ├── hero/
    │   ├── about/                    # About section (About.scss, SkillPill.scss)
    │   ├── experience/
    │   ├── projects/
    │   ├── writing/
    │   ├── contact/
    │   └── blog/
    │       ├── BlogIndex.jsx         # Blog listing page
    │       ├── BlogPostDetail.jsx    # Individual post renderer
    │       ├── PostRepository.js     # Loads + caches post metadata and bodies
    │       ├── PostProcessor.js      # MDX post transformation utilities
    │       ├── ViewTracker.js        # Post view count tracking
    │       ├── PremiumGate.jsx       # Premium content gate component
    │       └── index.js
    ├── hooks/
    │   ├── useTheme.jsx          # Light/dark mode toggle + persistence
    │   ├── useScrollReveal.js    # Intersection Observer scroll animations
    │   └── index.js
    ├── pages/
    │   ├── HomePage.jsx          # Assembles all portfolio sections
    │   ├── BlogPage.jsx          # Blog route page
    │   └── BlogPage.scss
    ├── seo/
    │   ├── SEO.jsx               # Helmet-based meta tag component
    │   ├── schemas.js            # JSON-LD structured data schemas
    │   └── keywords.js           # SEO keyword sets per page/post
    ├── site-container/           # Shared UI components
    │   ├── navbar/
    │   ├── footer/
    │   ├── button/
    │   ├── icons/
    │   ├── parallax-background/
    │   ├── section-header/
    │   ├── support-snackbar/
    │   ├── theme-toggle/
    │   └── index.js
    └── styles/
        ├── tokens.css            # Design tokens — single source of truth for colors/spacing
        └── global.css            # Reset, base styles, theme transitions, scrollbar, cursor glow
```

---

## Getting Started

```bash
npm install
npm start          # dev server at http://localhost:3000
npm run build      # production build → dist/
npm run preview    # preview the production build
```

---

## Updating Content

All content lives in `src/data/`. No component changes needed:

- `personal.js` — name, bio, email, social links
- `skills.js` — tech stack pills (name + brand color)
- `experience.js` — work history tabs
- `projects.js` — featured and secondary projects
- `blog/posts/` — add a new `.mdx` file to publish a blog post

---

## Contact Form

Replace the `setTimeout` stub in `src/features/contact/ContactForm.jsx` with a real request:

```js
// Example: Formspree
await fetch('https://formspree.io/f/YOUR_ID', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(values),
});
```

---

## License

Copyright (c) 2025 Soumyadeep Pradhan. All Rights Reserved.

This project is licensed under the
[Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International License](https://creativecommons.org/licenses/by-nc-nd/4.0/).

You may **not** copy, modify, distribute, or use this work — in whole or in part —
for any purpose without explicit written permission from the author.
