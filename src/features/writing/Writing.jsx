import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { SectionHeader, ArrowRightIcon } from '@components';
import { getRecentPosts } from '@features/blog/PostRepository.js';
import PostCard from '@features/blog/PostCard.jsx';
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
          {posts.map((post, index) => (
            <li key={post.slug}>
              <PostCard post={post} index={index} showImage={true} showTags={false} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
