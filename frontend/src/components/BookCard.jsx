import React from 'react';
import { Link } from 'react-router-dom';

const BookCard = ({
  book,
  actionButton,
  loading = false,
  disabled = false,
}) => {
  if (!book) return null;

  const {
    _id,
    title = 'Untitled Book',
    authors = [],
    isbn = '',
    coverImage = '',
    description = '',
    totalPages = 0,
    publishedDate = '',
  } = book;

  // Handle authors text gracefully
  const authorText = Array.isArray(authors) && authors.length > 0
    ? authors.join(', ')
    : 'Unknown Author';

  // Truncate long descriptions gracefully (~130 chars max)
  const truncatedDescription = description
    ? (description.length > 130 ? `${description.slice(0, 130).trim()}...` : description)
    : '';

  const cardContent = (
    <>
      <div className="book-cover-wrapper">
        {coverImage ? (
          <img
            src={coverImage}
            alt={`Cover for ${title}`}
            className="book-cover-img"
            onError={(e) => {
              e.target.style.display = 'none';
              if (e.target.nextSibling) {
                e.target.nextSibling.style.display = 'flex';
              }
            }}
          />
        ) : null}
        <div
          className="book-cover-placeholder"
          style={{ display: coverImage ? 'none' : 'flex' }}
        >
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
          </svg>
          <span>{title}</span>
        </div>
      </div>

      <div className="book-details">
        <h3 className="book-title" title={title}>
          {title}
        </h3>

        <p className="book-authors" title={authorText}>
          {authorText}
        </p>

        <div className="book-meta-info">
          {publishedDate && (
            <span className="book-meta-tag" title="Published Date">
              📅 {publishedDate}
            </span>
          )}
          {totalPages > 0 && (
            <span className="book-meta-tag" title="Page Count">
              📖 {totalPages} p.
            </span>
          )}
          {isbn && (
            <span className="book-meta-tag" title={`ISBN: ${isbn}`}>
              🏷️ {isbn}
            </span>
          )}
        </div>

        {truncatedDescription && (
          <p className="book-description" title={description}>
            {truncatedDescription}
          </p>
        )}
      </div>
    </>
  );

  return (
    <article className="book-card glass-card">
      {_id ? (
        <Link to={`/books/${_id}`} className="book-card-clickable-area">
          {cardContent}
        </Link>
      ) : (
        cardContent
      )}

      {actionButton && (
        <div className="book-card-action">
          {actionButton}
        </div>
      )}
    </article>
  );
};

export default BookCard;
