const searchBooks = async (query) => {
  const apiKey = process.env.GOOGLE_BOOKS_API_KEY;

  console.log("=================================");
  console.log("Google Books Debug");
  console.log("Query:", query);
  console.log(
    "API Key:",
    apiKey ? `${apiKey.slice(0, 6)}...${apiKey.slice(-4)}` : "MISSING"
  );
  console.log("=================================");

  if (!apiKey) {
    throw new Error("GOOGLE_BOOKS_API_KEY is missing");
  }

  const url =
    `https://www.googleapis.com/books/v1/volumes` +
    `?q=${encodeURIComponent(query)}` +
    `&maxResults=20` +
    `&key=${apiKey}`;

  console.log("Google Books URL:", url.replace(apiKey, "HIDDEN_API_KEY"));

  try {
    const response = await fetch(url);

    const data = await response.json();

    console.log("Google Books Status:", response.status);

    if (!response.ok) {
      console.error("Google Books Error:", data);

      throw new Error(
        data?.error?.message || "Google Books API request failed"
      );
    }

    return (data.items || []).map((item) => {
      const info = item.volumeInfo || {};

      const isbn13 = info.industryIdentifiers?.find(
        (identifier) => identifier.type === "ISBN_13"
      );

      const isbn10 = info.industryIdentifiers?.find(
        (identifier) => identifier.type === "ISBN_10"
      );

      return {
        googleBookId: item.id,
        title: info.title || "",
        authors: info.authors || [],
        isbn: isbn13?.identifier || isbn10?.identifier || "",
        coverImage:
          info.imageLinks?.thumbnail ||
          info.imageLinks?.smallThumbnail ||
          "",
        description: info.description || "",
        totalPages: info.pageCount || 0,
        publishedDate: info.publishedDate || "",
        categories: info.categories || [],
      };
    });
  } catch (error) {
    console.error("Google Books API error:", error.message);
    throw error;
  }
};

module.exports = { searchBooks };