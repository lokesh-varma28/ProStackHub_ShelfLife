const express = require("express");

const {
  searchGoogleBooks,
  addBook,
  getMyBooks,
  getBookById,
  updateBook,
  deleteBook,
} = require("../controllers/bookController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Search Google Books
router.get("/search", protect, searchGoogleBooks);

// Add book to user's shelf
router.post("/", protect, addBook);

// Get user's shelf
router.get("/", protect, getMyBooks);

// Get single book from user's shelf
router.get("/:id", protect, getBookById);

// Update book details in user's shelf
router.put("/:id", protect, updateBook);

// Delete book from user's shelf
router.delete("/:id", protect, deleteBook);

module.exports = router;