import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { booksAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const BookDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Action states
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [progressUpdating, setProgressUpdating] = useState(false);
  const [ratingUpdating, setRatingUpdating] = useState(false);
  const [reviewSaving, setReviewSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  // Feedback messages
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  // Form input states
  const [inputPage, setInputPage] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [pageError, setPageError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const fetchBookDetails = async () => {
    try {
      setLoading(true);
      setError('');
      setFeedback({ type: '', message: '' });
      const data = await booksAPI.getBookById(id);
      
      if (data.success && data.book) {
        setBook(data.book);
        setInputPage(data.book.currentPage !== undefined ? String(data.book.currentPage) : '0');
        setReviewText(data.book.review || '');
      } else {
        setError('Book not found.');
      }
    } catch (err) {
      console.error('Error fetching book details:', err);
      const is404 = err.response?.status === 404 || err.response?.status === 400;
      setError(
        is404
          ? 'Book not found or invalid book ID.'
          : err.response?.data?.message || 'Failed to load book details.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchBookDetails();
    }
  }, [id]);

  useEffect(() => {
    if (book?.title) {
      document.title = `ShelfLife — ${book.title}`;
    } else {
      document.title = 'ShelfLife — Book Details';
    }
  }, [book]);

  const showSuccessFeedback = (msg) => {
    setFeedback({ type: 'success', message: msg });
    setTimeout(() => {
      setFeedback((prev) => (prev.message === msg ? { type: '', message: '' } : prev));
    }, 4000);
  };

  const showErrorFeedback = (msg) => {
    setFeedback({ type: 'error', message: msg });
  };

  // Task 3: Update Status
  const handleStatusChange = async (newStatus) => {
    if (!book || newStatus === book.status || statusUpdating) return;

    try {
      setStatusUpdating(true);
      setFeedback({ type: '', message: '' });
      const res = await booksAPI.updateBook(id, { status: newStatus });
      if (res.success && res.book) {
        setBook(res.book);
        showSuccessFeedback(`Status updated to "${newStatus}"`);
      }
    } catch (err) {
      console.error('Error updating status:', err);
      showErrorFeedback(err.response?.data?.message || 'Failed to update reading status.');
    } finally {
      setStatusUpdating(false);
    }
  };

  // Task 4: Update Reading Progress
  const handleProgressSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!book || progressUpdating) return;

    setPageError('');
    const rawVal = String(inputPage).trim();

    if (rawVal === '' || isNaN(rawVal)) {
      setPageError('Please enter a valid page number.');
      return;
    }

    const numPage = Number(rawVal);

    if (!Number.isInteger(numPage) || numPage < 0) {
      setPageError('Current page cannot be negative.');
      return;
    }

    if (book.totalPages > 0 && numPage > book.totalPages) {
      setPageError(`Current page cannot exceed total pages (${book.totalPages}).`);
      return;
    }

    try {
      setProgressUpdating(true);
      setFeedback({ type: '', message: '' });
      const res = await booksAPI.updateBook(id, { currentPage: numPage });
      if (res.success && res.book) {
        setBook(res.book);
        setInputPage(String(res.book.currentPage));
        showSuccessFeedback('Reading progress updated!');
      }
    } catch (err) {
      console.error('Error updating progress:', err);
      showErrorFeedback(err.response?.data?.message || 'Failed to update reading progress.');
    } finally {
      setProgressUpdating(false);
    }
  };

  // Task 5 & 6: Star Rating
  const handleRatingChange = async (newRating) => {
    if (!book || ratingUpdating) return;
    if (newRating < 1 || newRating > 5) return;

    try {
      setRatingUpdating(true);
      setFeedback({ type: '', message: '' });
      const res = await booksAPI.updateBook(id, { rating: newRating });
      if (res.success && res.book) {
        setBook(res.book);
        showSuccessFeedback(`Rated ${newRating} star${newRating > 1 ? 's' : ''}!`);
      }
    } catch (err) {
      console.error('Error updating rating:', err);
      showErrorFeedback(err.response?.data?.message || 'Failed to update rating.');
    } finally {
      setRatingUpdating(false);
    }
  };

  // Task 7: Save Review
  const handleSaveReview = async (e) => {
    if (e) e.preventDefault();
    if (!book || reviewSaving) return;

    try {
      setReviewSaving(true);
      setFeedback({ type: '', message: '' });
      const res = await booksAPI.updateBook(id, { review: reviewText });
      if (res.success && res.book) {
        setBook(res.book);
        showSuccessFeedback('Review saved successfully!');
      }
    } catch (err) {
      console.error('Error saving review:', err);
      showErrorFeedback(err.response?.data?.message || 'Failed to save review.');
    } finally {
      setReviewSaving(false);
    }
  };

  // Task 8: Delete Book
  const handleDeleteBook = async () => {
    if (!book || deleting) return;

    try {
      setDeleting(true);
      setFeedback({ type: '', message: '' });
      await booksAPI.deleteBook(id);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      console.error('Error deleting book:', err);
      showErrorFeedback(err.response?.data?.message || 'Failed to delete book.');
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (loading) {
    return (
      <div className="book-details-page container">
        <div className="search-loading">
          <LoadingSpinner message="Loading book details..." />
        </div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="book-details-page container">
        <div className="glass-card empty-results">
          <div className="empty-icon color-error">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>
          <h3>Book Not Found</h3>
          <p>{error || 'The requested book could not be found on your shelf.'}</p>
          <Link to="/dashboard" className="btn btn-primary" style={{ marginTop: '1.25rem' }}>
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const {
    title = 'Untitled Book',
    authors = [],
    isbn = '',
    coverImage = '',
    description = '',
    totalPages = 0,
    currentPage = 0,
    status = 'Want to Read',
    rating = 0,
    review = '',
    publishedDate = '',
  } = book;

  const authorText = Array.isArray(authors) && authors.length > 0 ? authors.join(', ') : 'Unknown Author';
  
  // Progress calculations
  const progressPercent = totalPages > 0 
    ? Math.min(100, Math.max(0, Math.round((currentPage / totalPages) * 100))) 
    : 0;

  return (
    <div className="book-details-page container">
      {/* Top Bar with Navigation */}
      <div className="details-top-bar">
        <Link to="/dashboard" className="back-link">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          <span>Back to Shelf</span>
        </Link>
      </div>

      {/* Global Feedback Banner */}
      {feedback.message && (
        <div className={`alert ${feedback.type === 'success' ? 'alert-success' : 'alert-error'} details-alert`}>
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Main Layout Grid */}
      <div className="details-grid">
        {/* Left Column: Cover & Quick Metadata */}
        <div className="details-cover-col glass-card">
          <div className="book-cover-wrapper details-cover-wrapper">
            {coverImage ? (
              <img
                src={coverImage}
                alt={`Cover for ${title}`}
                className="book-cover-img details-cover-img"
                onError={(e) => {
                  e.target.style.display = 'none';
                  if (e.target.nextSibling) {
                    e.target.nextSibling.style.display = 'flex';
                  }
                }}
              />
            ) : null}
            <div
              className="book-cover-placeholder details-cover-placeholder"
              style={{ display: coverImage ? 'none' : 'flex' }}
            >
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
              </svg>
              <span>{title}</span>
            </div>
          </div>

          <div className="details-quick-meta">
            <div className="meta-row">
              <span className="meta-label">ISBN</span>
              <span className="meta-val">{isbn || 'N/A'}</span>
            </div>
            <div className="meta-row">
              <span className="meta-label">Pages</span>
              <span className="meta-val">{totalPages > 0 ? totalPages : 'N/A'}</span>
            </div>
            {publishedDate && (
              <div className="meta-row">
                <span className="meta-label">Published</span>
                <span className="meta-val">{publishedDate}</span>
              </div>
            )}
          </div>

          {/* Delete Action Button */}
          <div className="details-delete-wrapper">
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="btn btn-outline-danger btn-full"
              disabled={deleting}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
              <span>Delete from Shelf</span>
            </button>
          </div>
        </div>

        {/* Right Column: Information & Interactive Reading Management */}
        <div className="details-content-col">
          {/* Header Card */}
          <div className="glass-card details-header-card">
            <h1 className="details-title">{title}</h1>
            <p className="details-author">by {authorText}</p>
            {description && (
              <div className="details-description-box">
                <h3>About this book</h3>
                <p>{description}</p>
              </div>
            )}
          </div>

          {/* Task 3: Reading Status Selector Card */}
          <div className="glass-card details-section-card">
            <div className="section-header-row">
              <h3>Reading Status</h3>
              {statusUpdating && <div className="spinner spinner-xs"></div>}
            </div>
            <div className="status-selector-grid">
              {['Want to Read', 'Reading', 'Read'].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => handleStatusChange(st)}
                  className={`status-btn ${status === st ? 'active' : ''}`}
                  disabled={statusUpdating}
                >
                  {st === 'Reading' && '📖 '}
                  {st === 'Read' && '✅ '}
                  {st === 'Want to Read' && '🔖 '}
                  <span>{st}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Task 4: Reading Progress Card */}
          <div className="glass-card details-section-card">
            <div className="section-header-row">
              <h3>Reading Progress</h3>
              <span className="progress-badge">{progressPercent}% Completed</span>
            </div>

            <div className="progress-bar-bg details-progress-bg">
              <div
                className="progress-bar-fill"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>

            <form onSubmit={handleProgressSubmit} className="progress-form">
              <div className="progress-input-group">
                <label htmlFor="currentPageInput" className="input-label">Current Page</label>
                <div className="page-input-wrapper">
                  <input
                    id="currentPageInput"
                    type="number"
                    min="0"
                    max={totalPages > 0 ? totalPages : undefined}
                    value={inputPage}
                    onChange={(e) => {
                      setInputPage(e.target.value);
                      setPageError('');
                    }}
                    className={`form-input page-input ${pageError ? 'input-error' : ''}`}
                    placeholder="0"
                  />
                  <span className="total-pages-suffix">/ {totalPages > 0 ? totalPages : '?'} pages</span>
                </div>
              </div>
              <button
                type="submit"
                className="btn btn-secondary update-page-btn"
                disabled={progressUpdating}
              >
                {progressUpdating ? 'Updating...' : 'Update Progress'}
              </button>
            </form>
            {pageError && <p className="error-msg" style={{ marginTop: '0.5rem' }}>{pageError}</p>}
          </div>

          {/* Task 5 & 6: Rating Selector Card */}
          <div className="glass-card details-section-card">
            <div className="section-header-row">
              <h3>Rating</h3>
              {ratingUpdating && <div className="spinner spinner-xs"></div>}
            </div>
            <div className="star-rating-container">
              {[1, 2, 3, 4, 5].map((starVal) => (
                <button
                  key={starVal}
                  type="button"
                  onClick={() => handleRatingChange(starVal)}
                  className={`star-btn ${starVal <= rating ? 'filled' : ''}`}
                  disabled={ratingUpdating}
                  title={`Rate ${starVal} star${starVal > 1 ? 's' : ''}`}
                >
                  ★
                </button>
              ))}
              <span className="rating-label-text">
                {rating > 0 ? `${rating} of 5 stars` : 'Tap stars to rate'}
              </span>
            </div>
          </div>

          {/* Task 7: Written Review Card */}
          <div className="glass-card details-section-card">
            <div className="section-header-row">
              <h3>Written Review</h3>
            </div>
            <form onSubmit={handleSaveReview} className="review-form">
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Write your thoughts, notes, or critique of this book..."
                rows="4"
                className="form-input review-textarea"
              ></textarea>
              <div className="review-form-actions">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={reviewSaving}
                >
                  {reviewSaving ? 'Saving...' : 'Save Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Task 8: Confirmation Modal for Delete */}
      {showDeleteConfirm && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="delete-modal-title">
          <div className="modal-content glass-card">
            <div className="modal-header">
              <h3 id="delete-modal-title">Delete from Shelf</h3>
            </div>
            <p className="modal-body">
              Are you sure you want to remove <strong>"{title}"</strong> from your shelf? This action cannot be undone.
            </p>
            <div className="modal-footer">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="btn btn-secondary"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteBook}
                className="btn btn-danger"
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookDetails;
