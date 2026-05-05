# Soumyadeep's Portfolio

Personal portfolio and blog built with React, Vite, MDX, and SCSS.

Live at [soumya.io](https://soumya.io)

---

## Features

- Single-page portfolio with smooth section scrolling
- Blog powered by MDX, write posts in Markdown, rendered as React components
- Light / dark mode with flash-free theme persistence and circular reveal transition
- Parallax background with mouse-tracking blurred orbs
- Animated skill pills, tabbed experience section, working contact form (EmailJS)
- Full SEO: JSON-LD schemas, Open Graph, Twitter Card, sitemap, RSS feed, llms.txt
- Two-tier blog loading: metadata eager, post bodies lazy per-post
- Per-post view tracking via Supabase
- Premium content gate for select posts
- Build-time OG image generation, branded PNG per blog post, no runtime dependency

---

## Tech Stack

| Layer | Technology |
|---|---|
| UI Framework | React 18 |
| Build Tool | Vite 5 |
| Language | JavaScript (ESM) |
| Styling | SCSS (Sass modern compiler) |
| Blog / Content | MDX 3 (`@mdx-js/rollup`, `@mdx-js/react`) |
| Routing | React Router DOM v6 |
| SEO | React Helmet Async, JSON-LD, Open Graph, Twitter Card |
| Static Generation | Custom Vite plugins (sitemap, prerender, OG images) |
| Contact Form | EmailJS (`@emailjs/browser`) |
| View Tracking | Supabase (`@supabase/supabase-js`) |
| OG Image Rendering | `@resvg/resvg-js` (Rust-based SVG to PNG, no browser needed) |

---

## Key Concepts

- **Two-tier blog loading** post metadata is loaded eagerly for listing; post body MDX is loaded lazily per-post to keep the initial bundle small
- **Inline blog preview images** each MDX post exports a `PreviewImage` React component (an SVG illustration) that is rendered directly in the blog index card. Because it's a React component, it uses CSS custom properties and responds to light/dark mode automatically, no static image files needed
- **Flash-free theming** theme is persisted to `localStorage` and applied before React hydrates, preventing a flash of wrong theme on load. Uses the View Transitions API for a circular reveal animation
- **Build-time OG images** `vite-plugin-og-image.js` generates a branded PNG for every blog post at build time using `@resvg/resvg-js`. No browser, no Puppeteer, no runtime image service. These are the social share images (WhatsApp, LinkedIn, Slack), separate from the in-card `PreviewImage`
- **Pre-rendered static HTML** `vite-plugin-prerender.js` writes a static `index.html` per route with OG/Twitter meta tags baked in. WhatsApp, LinkedIn, and Slack scrapers get the correct image and title without executing any JavaScript
- **Premium content gate** posts with `isPremium: true` in frontmatter are gated behind a paywall. Unlock codes are stored in `VITE_PREMIUM_CODES` (comma-separated 8-digit codes). Unlock state is encrypted in `localStorage` using `VITE_ENCRYPTION_KEY`
- **Path aliases** `@`, `@app`, `@components`, `@features`, `@hooks`, `@pages`, `@styles`, `@data`, `@config` configured in `vite.config.js` for clean imports
- **Design tokens** all colors, spacing, and typography live in `src/styles/tokens.css` as CSS custom properties, consumed across all SCSS files
- **Performance-first React** memoized components, throttled scroll handlers, debounced search, and careful async cleanup prevent memory leaks and ensure 60fps scrolling

---

## Project Structure

```
├── public/                        # Static assets (favicon, robots.txt, manifest, RSS, redirects)
│   └── og-image.svg               # Homepage OG image source (rendered to PNG at build time)
├── scripts/
│   ├── vite-plugin-og-image.js    # Generates dist/og-image.png + dist/og-images/{slug}.png
│   ├── vite-plugin-prerender.js   # Writes static HTML per route with baked-in OG tags
│   └── vite-plugin-sitemap.js     # Auto-generates sitemap.xml + RSS feed
└── src/
    ├── app/
    │   ├── App.jsx                # Root component, router, providers
    │   └── main.jsx               # React DOM entry point
    ├── config/
    │   └── site.js                # Site constants, nav items, route definitions
    ├── data/                      # All content lives here, edit to update the site
    │   ├── personal.js            # Name, bio, email, social links
    │   ├── skills.js              # Tech stack pills (name + brand color)
    │   ├── experience.js          # Work history tabs
    │   ├── projects.js            # Featured and secondary projects
    │   ├── index.js               # Re-exports all data
    │   └── blog/
    │       └── posts/             # MDX blog posts (one file per post)
    ├── features/                  # Self-contained page sections
    │   ├── hero/
    │   ├── about/
    │   ├── experience/
    │   ├── projects/
    │   ├── writing/
    │   ├── contact/
    │   └── blog/
    │       ├── BlogIndex.jsx      # Blog listing page
    │       ├── BlogPostDetail.jsx # Individual post renderer + feedback form
    │       ├── PostRepository.js  # Loads + caches post metadata and bodies
    │       ├── PostProcessor.js   # MDX post transformation utilities
    │       ├── ViewTracker.js     # Post view count via Supabase
    │       ├── PremiumGate.jsx    # Premium content gate component
    │       └── index.js
    ├── hooks/
    │   ├── useTheme.jsx           # Light/dark mode toggle + persistence
    │   ├── useScrollReveal.js     # Intersection Observer scroll animations
    │   └── index.js
    ├── pages/
    │   ├── HomePage.jsx           # Assembles all portfolio sections
    │   └── BlogPage.jsx           # Blog index + post detail route
    ├── seo/
    │   ├── SEO.jsx                # Helmet-based meta tag component
    │   ├── schemas.js             # JSON-LD structured data schemas
    │   └── keywords.js            # SEO keyword sets per page/post
    ├── site-container/            # Shared UI components
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
        ├── tokens.css             # Design tokens, single source of truth for colors/spacing
        └── global.css             # Reset, base styles, theme transitions, scrollbar, cursor glow
```

---

## Getting Started

```bash
npm install
npm start          # dev server at http://localhost:3000
npm run build      # production build to dist/
npm run preview    # preview the production build
```

---

## Environment Variables

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

| Variable | Purpose |
|---|---|
| `VITE_EMAILJS_SERVICE_ID` | EmailJS service ID for the contact form |
| `VITE_EMAILJS_TEMPLATE_ID` | EmailJS template ID |
| `VITE_EMAILJS_PUBLIC_KEY` | EmailJS public key |
| `VITE_SUPABASE_URL` | Supabase project URL for view tracking |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key |
| `VITE_PREMIUM_CODES` | Comma-separated access codes for premium posts |
| `VITE_ENCRYPTION_KEY` | Key used to encrypt/decrypt premium content |

---

## Updating Content

All content lives in `src/data/`. No component changes needed:

| File | What to edit |
|---|---|
| `personal.js` | Name, bio, tagline, email, social links |
| `skills.js` | Tech stack pills (name + brand color) |
| `experience.js` | Work history tabs |
| `projects.js` | Featured and secondary projects |
| `blog/posts/*.mdx` | Add a new `.mdx` file to publish a blog post |

### Adding a blog post

Create `src/data/blog/posts/your-post-slug.mdx`:

```mdx
export const frontmatter = {
  title: "Your Post Title",
  date: "2026-01-01",
  readTime: "5 min",
  excerpt: "A short description shown in the listing and used as the OG description.",
  author: "Soumyadeep Pradhan",
  tags: ["tag1", "tag2"],
  isPremium: false,   // set to true to gate content behind the premium paywall
}

export function PreviewImage() {
  // This SVG is shown as the card thumbnail on the blog index.
  // Use CSS variables (var(--color-accent) etc.) it's theme-aware.
  return (
    <svg viewBox="0 0 720 200" xmlns="http://www.w3.org/2000/svg"
      style={{width:'100%',height:'100%',display:'block'}}>
      {/* your preview illustration */}
    </svg>
  );
}

Your post content in Markdown here...
```

**Notes:**
- The slug is automatically derived from the filename, do not add a `slug` field to frontmatter.
- Use ISO 8601 date format (`YYYY-MM-DD`) for consistent parsing.
- `PreviewImage` is a React component rendered inline in the blog card. It has access to all CSS custom properties so it responds to light/dark mode automatically.
- If `PreviewImage` is omitted, the card falls back to a gradient color.
- The OG image (for WhatsApp/LinkedIn previews), sitemap entry, and pre-rendered HTML are all generated automatically on the next build.

---

## OG Image Generation

At build time, `scripts/vite-plugin-og-image.js`:

1. Reads every `.mdx` file in `src/data/blog/posts/`
2. Extracts `title`, `excerpt`, and `readTime` from the frontmatter
3. Builds an SVG template with the site's light theme (warm white background, blurred orbs, crimson accent)
4. Renders it to a 1200x630 PNG using `@resvg/resvg-js` (Rust-based, no browser needed)
5. Writes `dist/og-images/{slug}.png`

The homepage OG image is rendered from `public/og-image.svg` to `dist/og-image.png`.

`scripts/vite-plugin-prerender.js` then bakes the correct image URL into the static HTML for each route so WhatsApp, LinkedIn, and Slack scrapers get it without executing JavaScript.

---

## License

Copyright (c) 2025 Soumyadeep Pradhan. All Rights Reserved.

This project is licensed under the
[Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International License](https://creativecommons.org/licenses/by-nc-nd/4.0/).

You may **not** copy, modify, distribute, or use this work, in whole or in part,
for any purpose without explicit written permission from the author.
