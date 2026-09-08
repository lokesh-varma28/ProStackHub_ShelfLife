import React, { useState, useEffect } from 'react';
import { booksAPI } from '../services/api';
import BookCard from '../components/BookCard';
import LoadingSpinner from '../components/LoadingSpinner';

const SearchBooks = () => {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchError, setSearchError] = useState('');
  
  useEffect(() => {
    document.title = 'ShelfLife — Discover Books';
  }, []);

  // Track addition state per googleBookId
  // Format: { [googleBookId]: { status: 'idle' | 'loading' | 'added' | 'duplicate' | 'error', message?: string } }
  const [bookStates, setBookStates] = useState({});

  const handleSearch = async (e) => {
    if (e) e.preventDefault();

    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;

    try {
      setLoading(true);
      setSearchError('');
      setHasSearched(true);
      const data = await booksAPI.searchBooks(trimmedQuery);
      
      if (data.success && Array.isArray(data.books)) {
        setSearchResults(data.books);
      } else {
        setSearchResults([]);
      }
    } catch (err) {
      console.error('Error searching books:', err);
      setSearchResults([]);
      setSearchError(
        err.response?.data?.message ||
        'Failed to search books. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAddBook = async (book) => {
    const bookId = book.googleBookId;
    if (!bookId) return;

    // Set per-book loading state
    setBookStates((prev) => ({
      ...prev,
      [bookId]: { status: 'loading' },
    }));

    try {
      const payload = {
        googleBookId: book.googleBookId,
        title: book.title,
        authors: book.authors || [],
        isbn: book.isbn || '',
        coverImage: book.coverImage || '',
        description: book.description || '',
        totalPages: book.totalPages || 0,
      };

      await booksAPI.addBook(payload);

      // On success: update local state
      setBookStates((prev) => ({
        ...prev,
        [bookId]: {
          status: 'added',
          message: 'Added to Shelf',
        },
      }));
    } catch (err) {
      console.error('Add to shelf error:', err);
      const isDuplicate = err.response?.status === 409 ||
        err.response?.data?.message?.toLowerCase().includes('already exists');

      if (isDuplicate) {
        setBookStates((prev) => ({
          ...prev,
          [bookId]: {
            status: 'duplicate',
            message: 'This book is already in your shelf.',
          },
        }));
      } else {
        setBookStates((prev) => ({
          ...prev,
          [bookId]: {
            status: 'error',
            message: err.response?.data?.message || 'Failed to add book.',
          },
        }));
      }
    }
  };

  return (
    <div className="search-page container">
      {/* Header section */}
      <section className="search-header glass-card">
        <h1 className="page-title">Discover Books</h1>
        <p className="page-subtitle">
          Search millions of titles from Google Books and add them directly to your personal reading shelf.
        </p>

        {/* Search Bar Form */}
        <form onSubmit={handleSearch} className="search-bar-form">
          <div className="search-input-wrapper">
            <svg
              className="search-input-icon"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              className="search-input"
              placeholder="Search by title, author, or ISBN..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search books"
            />
            {query && (
              <button
                type="button"
                className="clear-input-btn"
                onClick={() => setQuery('')}
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>
          <button
            type="submit"
            className="btn btn-primary search-submit-btn"
            disabled={loading || !query.trim()}
          >
            {loading ? (
              <>
                <div className="spinner spinner-xs"></div>
                <span>Searching...</span>
              </>
            ) : (
              <span>Search</span>
            )}
          </button>
        </form>
      </section>

      {/* Main Content / Search Results */}
      <section className="search-results-section">
        {searchError && (
          <div className="alert alert-error">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span>{searchError}</span>
          </div>
        )}

        {loading ? (
          <div className="search-loading">
            <LoadingSpinner message="Searching Google Books..." />
          </div>
        ) : hasSearched && searchResults.length === 0 && !searchError ? (
          <div className="empty-results glass-card">
            <div className="empty-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>
            <h3>No books found</h3>
            <p>We couldn't find any books matching "{query}". Try checking for spelling errors or searching for a different keyword.</p>
          </div>
        ) : (
          searchResults.length > 0 && (
            <>
              <div className="results-count-bar">
                <span>Found {searchResults.length} {searchResults.length === 1 ? 'result' : 'results'} for "{query}"</span>
              </div>
              <div className="books-grid">
                {searchResults.map((book) => {
                  const state = bookStates[book.googleBookId] || { status: 'idle' };
                  const isBookLoading = state.status === 'loading';
                  const isAdded = state.status === 'added';
                  const isDuplicate = state.status === 'duplicate';

                  const renderActionButton = () => {
                    if (isAdded) {
                      return (
                        <div className="add-feedback-container">
                          <button
                            className="btn btn-secondary btn-full btn-added"
                            disabled
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                            <span>Added to Shelf</span>
                          </button>
                        </div>
                      );
                    }

                    if (isDuplicate) {
                      return (
                        <div className="add-feedback-container">
                          <button
                            className="btn btn-secondary btn-full btn-duplicate"
                            disabled
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="12" cy="12" r="10"></circle>
                              <line x1="12" y1="8" x2="12" y2="12"></line>
                              <line x1="12" y1="16" x2="12.01" y2="16"></line>
                            </svg>
                            <span>In Your Shelf</span>
                          </button>
                          <p className="duplicate-msg">{state.message}</p>
                        </div>
                      );
                    }

                    return (
                      <div className="add-feedback-container">
                        <button
                          onClick={() => handleAddBook(book)}
                          className="btn btn-primary btn-full"
                          disabled={isBookLoading}
                        >
                          {isBookLoading ? (
                            <>
                              <div className="spinner spinner-xs"></div>
                              <span>Adding...</span>
                            </>
                          ) : (
                            <>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="12" y1="5" x2="12" y2="19"></line>
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                              </svg>
                              <span>Add to Shelf</span>
                            </>
                          )}
                        </button>
                        {state.status === 'error' && (
                          <p className="error-msg">{state.message}</p>
                        )}
                      </div>
                    );
                  };

                  return (
                    <BookCard
                      key={book.googleBookId}
                      book={book}
                      actionButton={renderActionButton()}
                    />
                  );
                })}
              </div>
            </>
          )
        )}
      </section>
    </div>
  );
};

export default SearchBooks;
