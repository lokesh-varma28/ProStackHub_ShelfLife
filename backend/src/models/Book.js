const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    googleBookId: {
      type: String,
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    authors: {
      type: [String],
      default: [],
    },

    isbn: {
      type: String,
      default: "",
    },

    coverImage: {
      type: String,
      default: "",
    },

    description: {
      type: String,
      default: "",
    },

    totalPages: {
      type: Number,
      default: 0,
    },

    currentPage: {
      type: Number,
      default: 0,
      min: 0,
    },

    status: {
      type: String,
      enum: ["Want to Read", "Reading", "Read"],
      default: "Want to Read",
    },

    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },

    review: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

bookSchema.index(
  { user: 1, googleBookId: 1 },
  { unique: true }
);

module.exports = mongoose.model("Book", bookSchema);