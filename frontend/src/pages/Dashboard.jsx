import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { booksAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  const fetchBooks = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await booksAPI.getBooks();
      if (data.success && Array.isArray(data.books)) {
        setBooks(data.books);
      } else {
        setBooks([]);
      }
    } catch (err) {
      console.error('Error fetching user shelf books:', err);
      setError(
        err.response?.data?.message ||
        'Failed to load your book shelf. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = 'ShelfLife — My Shelf';
    fetchBooks();
  }, []);

  const totalBooks = books.length;
  const wantToReadCount = books.filter((b) => b.status === 'Want to Read').length;
  const readingCount = books.filter((b) => b.status === 'Reading').length;
  const readCount = books.filter((b) => b.status === 'Read').length;

  const filteredBooks = books.filter((b) => {
    if (activeFilter === 'All') return true;
    return b.status === activeFilter;
  });

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Reading':
        return 'badge-reading';
      case 'Read':
        return 'badge-read';
      case 'Want to Read':
      default:
        return 'badge-want';
    }
  };

  return (
    <div className="dashboard-page container">
      {/* Welcome Banner */}
      <section className="welcome-banner glass-card">
        <div className="welcome-content">
          <div className="welcome-text">
            <span className="welcome-pill">Personal Library</span>
            <h1 className="welcome-title">
              Welcome back, <span className="highlight-text">{user?.name || 'Reader'}</span>!
            </h1>
            <p className="welcome-subtitle">
              Track your reading progress, organize your shelf, and build lasting reading habits.
            </p>
          </div>
          <div className="welcome-actions">
            <Link to="/search" className="btn btn-primary">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <span>Discover Books</span>
            </Link>
            <button onClick={logout} className="btn btn-secondary logout-banner-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="stats-grid">
          <div className={`stat-card ${activeFilter === 'All' ? 'active' : ''}`} onClick={() => setActiveFilter('All')}>
            <div className="stat-number">{totalBooks}</div>
            <div className="stat-label">Total Books</div>
          </div>
          <div className={`stat-card ${activeFilter === 'Reading' ? 'active' : ''}`} onClick={() => setActiveFilter('Reading')}>
            <div className="stat-number color-reading">{readingCount}</div>
            <div className="stat-label">Currently Reading</div>
          </div>
          <div className={`stat-card ${activeFilter === 'Read' ? 'active' : ''}`} onClick={() => setActiveFilter('Read')}>
            <div className="stat-number color-read">{readCount}</div>
            <div className="stat-label">Completed</div>
          </div>
          <div className={`stat-card ${activeFilter === 'Want to Read' ? 'active' : ''}`} onClick={() => setActiveFilter('Want to Read')}>
            <div className="stat-number color-want">{wantToReadCount}</div>
            <div className="stat-label">Want to Read</div>
          </div>
        </div>
      </section>

      {/* Main Content / Shelf */}
      <section className="shelf-section">
        <div className="shelf-header">
          <div className="shelf-title-group">
            <h2>Your Reading Shelf</h2>
            <span className="shelf-count-tag">{filteredBooks.length} {filteredBooks.length === 1 ? 'book' : 'books'}</span>
          </div>

          <div className="filter-tabs">
            {['All', 'Reading', 'Want to Read', 'Read'].map((tab) => (
              <button
                key={tab}
                className={`tab-btn ${activeFilter === tab ? 'active' : ''}`}
                onClick={() => setActiveFilter(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="alert alert-error">
            <span>{error}</span>
            <button onClick={fetchBooks} className="btn btn-sm btn-outline">
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <div className="shelf-loading">
            <LoadingSpinner message="Fetching your books..." />
          </div>
        ) : filteredBooks.length === 0 ? (
          <div className="empty-shelf glass-card">
            <div className="empty-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                <path d="M9 10h6"></path>
              </svg>
            </div>
            <h3>
              {activeFilter === 'All'
                ? 'Your shelf is empty'
                : `No books tagged as "${activeFilter}"`}
            </h3>
            <p>
              {activeFilter === 'All'
                ? "You haven't added any books to your personal library yet."
                : `No books matching the "${activeFilter}" filter were found on your shelf.`}
            </p>
            {activeFilter === 'All' && (
              <Link to="/search" className="btn btn-primary" style={{ marginTop: '1.25rem' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <span>Discover Books</span>
              </Link>
            )}
          </div>
        ) : (
          <div className="books-grid">
            {filteredBooks.map((book) => (
              <Link key={book._id} to={`/books/${book._id}`} className="book-card-link">
                <div className="book-card glass-card">
                  <div className="book-cover-wrapper">
                    {book.coverImage ? (
                      <img
                        src={book.coverImage}
                        alt={book.title}
                        className="book-cover-img"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div
                      className="book-cover-placeholder"
                      style={{ display: book.coverImage ? 'none' : 'flex' }}
                    >
                      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                      </svg>
                      <span>{book.title}</span>
                    </div>
                    <span className={`status-badge ${getStatusBadgeClass(book.status)}`}>
                      {book.status}
                    </span>
                  </div>

                  <div className="book-details">
                    <h3 className="book-title" title={book.title}>
                      {book.title}
                    </h3>
                    <p className="book-authors">
                      {Array.isArray(book.authors) && book.authors.length > 0
                        ? book.authors.join(', ')
                        : 'Unknown Author'}
                    </p>

                    {book.totalPages > 0 && (
                      <div className="reading-progress">
                        <div className="progress-info">
                          <span>Progress</span>
                          <span>
                            {book.currentPage || 0} / {book.totalPages} pages
                          </span>
                        </div>
                        <div className="progress-bar-bg">
                          <div
                            className="progress-bar-fill"
                            style={{
                              width: `${Math.min(
                                100,
                                Math.round(((book.currentPage || 0) / book.totalPages) * 100)
                              )}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    )}

                    {book.rating && (
                      <div className="book-rating">
                        {'★'.repeat(book.rating)}
                        <span className="star-empty">{'★'.repeat(5 - book.rating)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Dashboard;
