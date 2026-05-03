import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { SectionHeader, ArrowRightIcon } from '@components';
import { getRecentPosts } from '@features/blog/PostRepository.js';
import './Writing.scss';

export default function Writing() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    getRecentPosts(3).then(setPosts).catch(console.error);
  }, []);

  return (
    <section id="writing" className="section">
      <div className="container">
        <div className="writing__head">
          <SectionHeader number="04" label="Writing" title="Recent posts." />
          <Link to="/blog" className="writing__all">
            All posts <ArrowRightIcon size={14} />
          </Link>
        </div>

        <ul className="writing__list reveal">
          {posts.map((post) => (
            <li key={post.slug}>
              <Link to={`/blog/${post.slug}`} className="writing__item">
                <div className="writing__meta mono">
                  <span>{post.date}</span>
                  <span>·</span>
                  <span>{post.readTime} read</span>
                </div>
                <h3 className="writing__title">{post.title}</h3>
                <p className="writing__excerpt">{post.excerpt}</p>
                <span className="writing__cta">
                  Read article <ArrowRightIcon size={13} />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
