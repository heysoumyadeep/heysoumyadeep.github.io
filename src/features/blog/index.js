// src/features/blog/index.js
// Public entry point for the blog feature — used by BlogPage.jsx and Module Federation exposes

export { default as BlogIndex } from './BlogIndex.jsx';
export { default as BlogPostDetail } from './BlogPostDetail.jsx';
export { getAllPosts, getPostBySlug, getRecentPosts } from './PostRepository.js';
export { getViews, incrementView } from './ViewTracker.js';
