const BASE_URL = 'http://localhost:5000';

async function runTests() {
  const results = [];

  function record(name, passed, details, data = null) {
    results.push({ name, passed, details, data });
    const status = passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} - ${name}`);
    if (!passed || details) {
      console.log(`   Details: ${details}`);
    }
  }

  const testEmail = `test_${Date.now()}@example.com`;
  const testPassword = 'Password123!';
  let authToken = null;
  let addedBookId = null;

  console.log('\n========================================');
  console.log('  ShelfLife API Comprehensive Test Suite');
  console.log('========================================\n');

  // 1. Health Check
  try {
    const res = await fetch(`${BASE_URL}/`);
    const json = await res.json();
    if (res.status === 200 && json.success === true) {
      record('GET / (Health Check)', true, `Message: "${json.message}"`);
    } else {
      record('GET / (Health Check)', false, `Status: ${res.status}, Response: ${JSON.stringify(json)}`);
    }
  } catch (err) {
    record('GET / (Health Check)', false, `Error: ${err.message}`);
  }

  // 2. 404 Unknown Route
  try {
    const res = await fetch(`${BASE_URL}/api/unknown-endpoint`);
    const json = await res.json();
    if (res.status === 404 && json.success === false) {
      record('GET /api/unknown-endpoint (404 Handling)', true, `Returned 404 JSON: "${json.message}"`);
    } else {
      record('GET /api/unknown-endpoint (404 Handling)', false, `Expected 404 JSON, got ${res.status}: ${JSON.stringify(json)}`);
    }
  } catch (err) {
    record('GET /api/unknown-endpoint (404 Handling)', false, `Error: ${err.message}`);
  }

  // 3. Register Validation Error
  try {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail })
    });
    const json = await res.json();
    if (res.status === 400 && json.success === false) {
      record('POST /api/auth/register (Validation Error)', true, `Returned 400: "${json.message}"`);
    } else {
      record('POST /api/auth/register (Validation Error)', false, `Expected 400, got ${res.status}: ${JSON.stringify(json)}`);
    }
  } catch (err) {
    record('POST /api/auth/register (Validation Error)', false, `Error: ${err.message}`);
  }

  // 4. Register User Success
  try {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Senior Tester', email: testEmail, password: testPassword })
    });
    const json = await res.json();
    if (res.status === 201 && json.success === true && json.token) {
      authToken = json.token;
      record('POST /api/auth/register (Success)', true, `User ID: ${json.user.id}, Token issued`);
    } else {
      record('POST /api/auth/register (Success)', false, `Status: ${res.status}, Response: ${JSON.stringify(json)}`);
    }
  } catch (err) {
    record('POST /api/auth/register (Success)', false, `Error: ${err.message}`);
  }

  // 5. Register Duplicate Email
  try {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Duplicate Tester', email: testEmail, password: testPassword })
    });
    const json = await res.json();
    if (res.status === 409 && json.success === false) {
      record('POST /api/auth/register (Duplicate Email Prevention)', true, `Returned 409: "${json.message}"`);
    } else {
      record('POST /api/auth/register (Duplicate Email Prevention)', false, `Expected 409, got ${res.status}: ${JSON.stringify(json)}`);
    }
  } catch (err) {
    record('POST /api/auth/register (Duplicate Email Prevention)', false, `Error: ${err.message}`);
  }

  // 6. Login Invalid Password
  try {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: 'WrongPassword' })
    });
    const json = await res.json();
    if (res.status === 401 && json.success === false) {
      record('POST /api/auth/login (Invalid Password)', true, `Returned 401: "${json.message}"`);
    } else {
      record('POST /api/auth/login (Invalid Password)', false, `Expected 401, got ${res.status}: ${JSON.stringify(json)}`);
    }
  } catch (err) {
    record('POST /api/auth/login (Invalid Password)', false, `Error: ${err.message}`);
  }

  // 7. Login Success
  try {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: testPassword })
    });
    const json = await res.json();
    if (res.status === 200 && json.success === true && json.token) {
      authToken = json.token;
      record('POST /api/auth/login (Success)', true, `JWT Authentication Token received`);
    } else {
      record('POST /api/auth/login (Success)', false, `Status: ${res.status}, Response: ${JSON.stringify(json)}`);
    }
  } catch (err) {
    record('POST /api/auth/login (Success)', false, `Error: ${err.message}`);
  }

  // 8. GET /api/auth/me without token
  try {
    const res = await fetch(`${BASE_URL}/api/auth/me`);
    const json = await res.json();
    if (res.status === 401 && json.success === false) {
      record('GET /api/auth/me (Unauthorized - Missing Header)', true, `Returned 401: "${json.message}"`);
    } else {
      record('GET /api/auth/me (Unauthorized - Missing Header)', false, `Expected 401, got ${res.status}: ${JSON.stringify(json)}`);
    }
  } catch (err) {
    record('GET /api/auth/me (Unauthorized - Missing Header)', false, `Error: ${err.message}`);
  }

  // 9. GET /api/auth/me with valid token
  try {
    const res = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const json = await res.json();
    if (res.status === 200 && json.success === true && json.user) {
      record('GET /api/auth/me (Success)', true, `Fetched profile for ${json.user.email}`);
    } else {
      record('GET /api/auth/me (Success)', false, `Status: ${res.status}, Response: ${JSON.stringify(json)}`);
    }
  } catch (err) {
    record('GET /api/auth/me (Success)', false, `Error: ${err.message}`);
  }

  // 10. Search Books without query
  try {
    const res = await fetch(`${BASE_URL}/api/books/search`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const json = await res.json();
    if (res.status === 400 && json.success === false) {
      record('GET /api/books/search (Missing Query Param)', true, `Returned 400: "${json.message}"`);
    } else {
      record('GET /api/books/search (Missing Query Param)', false, `Expected 400, got ${res.status}: ${JSON.stringify(json)}`);
    }
  } catch (err) {
    record('GET /api/books/search (Missing Query Param)', false, `Error: ${err.message}`);
  }

  // 11. Search Books Success
  try {
    const res = await fetch(`${BASE_URL}/api/books/search?query=design+patterns`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const json = await res.json();
    if (res.status === 200 && json.success === true && Array.isArray(json.books)) {
      record('GET /api/books/search (Google Books API Success)', true, `Fetched ${json.count} books`);
    } else {
      record('GET /api/books/search (Google Books API Success)', false, `Status: ${res.status}, Response: ${JSON.stringify(json)}`);
    }
  } catch (err) {
    record('GET /api/books/search (Google Books API Success)', false, `Error: ${err.message}`);
  }

  // 12. Add Book Missing Fields
  try {
    const res = await fetch(`${BASE_URL}/api/books`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ title: 'Book without googleBookId' })
    });
    const json = await res.json();
    if (res.status === 400 && json.success === false) {
      record('POST /api/books (Missing googleBookId)', true, `Returned 400: "${json.message}"`);
    } else {
      record('POST /api/books (Missing googleBookId)', false, `Expected 400, got ${res.status}: ${JSON.stringify(json)}`);
    }
  } catch (err) {
    record('POST /api/books (Missing googleBookId)', false, `Error: ${err.message}`);
  }

  // 13. Add Book Success
  const testGoogleBookId = `test_gb_${Date.now()}`;
  try {
    const res = await fetch(`${BASE_URL}/api/books`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        googleBookId: testGoogleBookId,
        title: 'Clean Architecture',
        authors: ['Robert C. Martin'],
        isbn: '9780134494166',
        coverImage: 'http://example.com/cover.jpg',
        description: 'A Craftsman Guide to Software Structure and Design',
        totalPages: 432
      })
    });
    const json = await res.json();
    if (res.status === 201 && json.success === true && json.book) {
      addedBookId = json.book._id;
      record('POST /api/books (Add Book to Shelf)', true, `Book added with ID: ${json.book._id}`);
    } else {
      record('POST /api/books (Add Book to Shelf)', false, `Status: ${res.status}, Response: ${JSON.stringify(json)}`);
    }
  } catch (err) {
    record('POST /api/books (Add Book to Shelf)', false, `Error: ${err.message}`);
  }

  // 14. Add Duplicate Book
  try {
    const res = await fetch(`${BASE_URL}/api/books`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        googleBookId: testGoogleBookId,
        title: 'Clean Architecture'
      })
    });
    const json = await res.json();
    if (res.status === 409 && json.success === false) {
      record('POST /api/books (Duplicate Book Prevention)', true, `Returned 409: "${json.message}"`);
    } else {
      record('POST /api/books (Duplicate Book Prevention)', false, `Expected 409, got ${res.status}: ${JSON.stringify(json)}`);
    }
  } catch (err) {
    record('POST /api/books (Duplicate Book Prevention)', false, `Error: ${err.message}`);
  }

  // 15. Get User Bookshelf
  try {
    const res = await fetch(`${BASE_URL}/api/books`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const json = await res.json();
    if (res.status === 200 && json.success === true && Array.isArray(json.books)) {
      record('GET /api/books (Get Shelf)', true, `Retrieved ${json.count} book(s)`);
    } else {
      record('GET /api/books (Get Shelf)', false, `Status: ${res.status}, Response: ${JSON.stringify(json)}`);
    }
  } catch (err) {
    record('GET /api/books (Get Shelf)', false, `Error: ${err.message}`);
  }

  // 16. Get Single Book By ID
  if (addedBookId) {
    try {
      const res = await fetch(`${BASE_URL}/api/books/${addedBookId}`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      const json = await res.json();
      if (res.status === 200 && json.success === true && json.book) {
        record('GET /api/books/:id (Get Book Details)', true, `Book fetched: "${json.book.title}"`);
      } else {
        record('GET /api/books/:id (Get Book Details)', false, `Status: ${res.status}, Response: ${JSON.stringify(json)}`);
      }
    } catch (err) {
      record('GET /api/books/:id (Get Book Details)', false, `Error: ${err.message}`);
    }

    // 17. Update Book (Invalid Status)
    try {
      const res = await fetch(`${BASE_URL}/api/books/${addedBookId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'InvalidStatus' })
      });
      const json = await res.json();
      if (res.status === 400 && json.success === false) {
        record('PUT /api/books/:id (Validation - Invalid Status)', true, `Returned 400: "${json.message}"`);
      } else {
        record('PUT /api/books/:id (Validation - Invalid Status)', false, `Expected 400, got ${res.status}: ${JSON.stringify(json)}`);
      }
    } catch (err) {
      record('PUT /api/books/:id (Validation - Invalid Status)', false, `Error: ${err.message}`);
    }

    // 18. Update Book (Invalid Rating)
    try {
      const res = await fetch(`${BASE_URL}/api/books/${addedBookId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ rating: 10 })
      });
      const json = await res.json();
      if (res.status === 400 && json.success === false) {
        record('PUT /api/books/:id (Validation - Invalid Rating)', true, `Returned 400: "${json.message}"`);
      } else {
        record('PUT /api/books/:id (Validation - Invalid Rating)', false, `Expected 400, got ${res.status}: ${JSON.stringify(json)}`);
      }
    } catch (err) {
      record('PUT /api/books/:id (Validation - Invalid Rating)', false, `Error: ${err.message}`);
    }

    // 19. Update Book Details (Success)
    try {
      const res = await fetch(`${BASE_URL}/api/books/${addedBookId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentPage: 210,
          status: 'Reading',
          rating: 5,
          review: 'Essential reading for every software engineer!'
        })
      });
      const json = await res.json();
      if (res.status === 200 && json.success === true && json.book.currentPage === 210) {
        record('PUT /api/books/:id (Update Book Success)', true, `Updated status: "${json.book.status}", Progress: ${json.book.currentPage}/${json.book.totalPages}, Rating: ${json.book.rating}★`);
      } else {
        record('PUT /api/books/:id (Update Book Success)', false, `Status: ${res.status}, Response: ${JSON.stringify(json)}`);
      }
    } catch (err) {
      record('PUT /api/books/:id (Update Book Success)', false, `Error: ${err.message}`);
    }

    // 20. Invalid ObjectId Format Handling
    try {
      const res = await fetch(`${BASE_URL}/api/books/invalid-id-format`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      const json = await res.json();
      if (res.status === 400 && json.success === false) {
        record('GET /api/books/:id (CastError Handling)', true, `Returned 400: "${json.message}"`);
      } else {
        record('GET /api/books/:id (CastError Handling)', false, `Expected 400, got ${res.status}: ${JSON.stringify(json)}`);
      }
    } catch (err) {
      record('GET /api/books/:id (CastError Handling)', false, `Error: ${err.message}`);
    }

    // 21. Delete Book Success
    try {
      const res = await fetch(`${BASE_URL}/api/books/${addedBookId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      const json = await res.json();
      if (res.status === 200 && json.success === true) {
        record('DELETE /api/books/:id (Delete Book Success)', true, `Book removed from shelf`);
      } else {
        record('DELETE /api/books/:id (Delete Book Success)', false, `Status: ${res.status}, Response: ${JSON.stringify(json)}`);
      }
    } catch (err) {
      record('DELETE /api/books/:id (Delete Book Success)', false, `Error: ${err.message}`);
    }

    // 22. Verify Book is Deleted
    try {
      const res = await fetch(`${BASE_URL}/api/books/${addedBookId}`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      const json = await res.json();
      if (res.status === 404 && json.success === false) {
        record('GET /api/books/:id (Deleted Book 404 Check)', true, `Returned 404: "${json.message}"`);
      } else {
        record('GET /api/books/:id (Deleted Book 404 Check)', false, `Expected 404, got ${res.status}: ${JSON.stringify(json)}`);
      }
    } catch (err) {
      record('GET /api/books/:id (Deleted Book 404 Check)', false, `Error: ${err.message}`);
    }
  }

  console.log('\n========================================');
  const passedCount = results.filter(r => r.passed).length;
  console.log(` SUMMARY REPORT`);
  console.log(` Total Executed Tests: ${results.length}`);
  console.log(` Passed: ${passedCount}`);
  console.log(` Failed: ${results.length - passedCount}`);
  console.log('========================================\n');
}

runTests();
