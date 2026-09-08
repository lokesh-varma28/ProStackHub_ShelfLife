const Book = require("../models/Book");
const { searchBooks } = require("../services/googleBooksService");

const searchGoogleBooks = async (req, res) => {
  try {
    const query = req.query.q || req.query.query;

    if (!query || !query.trim()) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    const books = await searchBooks(query.trim());

    res.json({
      success: true,
      count: books.length,
      books,
    });
  } catch (error) {
    console.error("Google Books search error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to search books",
    });
  }
};

const addBook = async (req, res) => {
  try {
    const {
      googleBookId,
      title,
      authors,
      isbn,
      coverImage,
      description,
      totalPages,
    } = req.body;

    if (!googleBookId || !title) {
      return res.status(400).json({
        success: false,
        message: "Google book ID and title are required",
      });
    }

    const existingBook = await Book.findOne({
      user: req.userId,
      googleBookId,
    });

    if (existingBook) {
      return res.status(409).json({
        success: false,
        message: "Book already exists in your shelf",
      });
    }

    const book = await Book.create({
      user: req.userId,
      googleBookId,
      title,
      authors: authors || [],
      isbn: isbn || "",
      coverImage: coverImage || "",
      description: description || "",
      totalPages: totalPages || 0,
    });

    res.status(201).json({
      success: true,
      message: "Book added to shelf",
      book,
    });
  } catch (error) {
    console.error("Add book error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to add book",
    });
  }
};

const getMyBooks = async (req, res) => {
  try {
    const books = await Book.find({
      user: req.userId,
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: books.length,
      books,
    });
  } catch (error) {
    console.error("Get books error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to get books",
    });
  }
};

const getBookById = async (req, res) => {
  try {
    const { id } = req.params;

    const book = await Book.findOne({
      _id: id,
      user: req.userId,
    });

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    res.json({
      success: true,
      book,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid book ID format",
      });
    }

    console.error("Get book error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to get book",
    });
  }
};

const updateBook = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, currentPage, totalPages, rating, review } = req.body;

    const book = await Book.findOne({
      _id: id,
      user: req.userId,
    });

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    if (status !== undefined) {
      const validStatuses = ["Want to Read", "Reading", "Read"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid status value. Allowed: 'Want to Read', 'Reading', 'Read'",
        });
      }
      book.status = status;
    }

    if (currentPage !== undefined) {
      if (typeof currentPage !== "number" || currentPage < 0) {
        return res.status(400).json({
          success: false,
          message: "Current page must be a non-negative number",
        });
      }
      book.currentPage = currentPage;
    }

    if (totalPages !== undefined) {
      if (typeof totalPages !== "number" || totalPages < 0) {
        return res.status(400).json({
          success: false,
          message: "Total pages must be a non-negative number",
        });
      }
      book.totalPages = totalPages;
    }

    if (rating !== undefined) {
      if (rating !== null && (typeof rating !== "number" || rating < 1 || rating > 5)) {
        return res.status(400).json({
          success: false,
          message: "Rating must be a number between 1 and 5",
        });
      }
      book.rating = rating;
    }

    if (review !== undefined) {
      book.review = String(review).trim();
    }

    await book.save();

    res.json({
      success: true,
      message: "Book updated successfully",
      book,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid book ID format",
      });
    }

    console.error("Update book error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update book",
    });
  }
};

const deleteBook = async (req, res) => {
  try {
    const { id } = req.params;

    const book = await Book.findOneAndDelete({
      _id: id,
      user: req.userId,
    });

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    res.json({
      success: true,
      message: "Book deleted successfully",
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid book ID format",
      });
    }

    console.error("Delete book error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete book",
    });
  }
};

module.exports = {
  searchGoogleBooks,
  addBook,
  getMyBooks,
  getBookById,
  updateBook,
  deleteBook,
};