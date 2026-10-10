
# Day 5 Assignment: Library Books API Design

## Overview

This REST API manages books in a library. The resource is called `books`.
Each book has a unique ID, title, author, publication year, and ISBN.

Base URL: `/api/books`

## 1. List all books

- **Method:** GET
- **Path:** `/api/books`
- **Description:** Retrieves a list of all books in the library.
- **Success status:** `200 OK`
- **Example request body:** None.

## 2. Get one book

- **Method:** GET
- **Path:** `/api/books/42`
- **Description:** Retrieves the details of the book with ID 42.
- **Success status:** `200 OK`
- **Example request body:** None.

## 3. Create a book

- **Method:** POST
- **Path:** `/api/books`
- **Description:** Creates a new book in the library.
- **Example request body:**

```json
{
  "title": "Things Fall Apart",
  "author": "Chinua Achebe",
  "publicationYear": 1958,
  "isbn": "9780385474542"
}
```

- **Success status:** `201 Created`

## 4. Update a book

- **Method:** PUT
- **Path:** `/api/books/42`
- **Description:** Replaces the details of the book with ID 42.
- **Example request body:**

```json
{
  "title": "Things Fall Apart",
  "author": "Chinua Achebe",
  "publicationYear": 1958,
  "isbn": "9780385474542"
}
```

- **Success status:** `200 OK`

## 5. Delete a book

- **Method:** DELETE
- **Path:** `/api/books/42`
- **Description:** Deletes the book with ID 42 from the library.
- **Success status:** `204 No Content`
- **Example request body:** None.

## 6. List books by author

- **Method:** GET
- **Path:** `/api/books?author=Chinua%20Achebe`
- **Description:** Retrieves books written by Chinua Achebe using the author query parameter.
- **Success status:** `200 OK`
- **Example request body:** None.

## Error status codes

### 400 Bad Request

- **Description:** The request is invalid or contains incorrect data.
- **Example:** A client tries to create a book without a required title.

### 404 Not Found

- **Description:** The requested resource does not exist.
- **Example:** A client requests `/api/books/9999`, but no book has that ID.
