// Builds a BlogPost object from an MDX module

// "../../data/blog/posts/my-post.mdx" → "my-post"
export function slugFromPath(filePath) {
  return filePath.split('/').pop().replace(/\.mdx$/, '');
}

export function buildPost(mod, filePath) {
  const slug = slugFromPath(filePath);
  const fm = mod.frontmatter ?? {};

  return {
    slug,
    title:    fm.title    != null ? String(fm.title)    : '',
    date:     fm.date     != null ? String(fm.date)     : '',
    readTime: fm.readTime != null ? String(fm.readTime) : '',
    excerpt:  fm.excerpt  != null ? String(fm.excerpt)  : '',
    author:   fm.author   != null ? String(fm.author)   : '',
    tags:     Array.isArray(fm.tags) ? fm.tags.map(String) : [],
    Component: mod.default,
  };
}
