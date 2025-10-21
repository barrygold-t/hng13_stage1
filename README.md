# String Analyzer API
A RESTful API that analyzes strings, computes their properties, and stores them for retrieval.  
Built with **Node.js**, **Express**, and **LowDB**.

## Table of Contents
- [Setup](#setup)
- [Running the Server](#running-the-server)
- [API Endpoints](#api-endpoints)
- [Testing](#testing)
- [Dependencies](#dependencies)

## Setup
1. Clone the repository:
```
git clone https://github.com/barrygold-t/hng13_stage1.git
cd stage1
```
2. Install dependencies:
```
npm install
```

## Running the Server
* Start normally:
```
npm start
```
* Default server port: `3000` (can be overridden via `PORT` environment variable).

## API Endpoints

### 1. Create / Analyze String

**POST** `/strings`
**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "value": "racecar"
}
```

**Success (201 Created):**
```json
{
  "id": "sha256_hash_value",
  "value": "racecar",
  "properties": {
    "length": 7,
    "is_palindrome": true,
    "unique_characters": 4,
    "word_count": 1,
    "sha256_hash": "sha256_hash_value",
    "character_frequency_map": { "r": 2, "a": 2, "c": 2, "e": 1 }
  },
  "created_at": "2025-10-21T10:00:00Z"
}
```

**Error Responses:**
* `400 Bad Request`: Missing or invalid body
* `409 Conflict`: String already exists
* `422 Unprocessable Entity`: Value is not a string

---

### 2. Get Specific String

**GET** `/strings/:string_value`

**Success (200 OK):**
```json
{
  "id": "sha256_hash_value",
  "value": "racecar",
  "properties": { /* same as above */ },
  "created_at": "2025-10-21T10:00:00Z"
}
```

**Error Response:**
`404 Not Found`: String not found

---

### 3. Get All Strings with Filtering
**GET** `/strings?is_palindrome=true&min_length=5&max_length=20&word_count=1&contains_character=a`
**Success (200 OK):**
```json
{
  "data": [ /* array of matching strings */ ],
  "count": 3,
  "filters_applied": {
    "is_palindrome": true,
    "min_length": 5,
    "max_length": 20,
    "word_count": 1,
    "contains_character": "a"
  }
}
```

**Error:** `400 Bad Request` for invalid query parameters

---

### 4. Natural Language Filtering

**GET** `/strings/filter-by-natural-language?query=all%20single%20word%20palindromic%20strings`

**Success (200 OK):**

```json
{
  "data": [ /* matching strings */ ],
  "count": 2,
  "interpreted_query": {
    "original": "all single word palindromic strings",
    "parsed_filters": {
      "word_count": 1,
      "is_palindrome": true
    }
  }
}
```

**Errors:**

* `400 Bad Request` if unable to parse query
* `422 Unprocessable Entity` if filters conflict

---

### 5. Delete String

**DELETE** `/strings/:string_value`

**Success (204 No Content):** Empty response
**Error (404):** String not found

---

## Testing

* Use **Postman** or **curl** to test all endpoints.
* Example curl for creating a string:

```bash
curl -X POST http://localhost:3000/strings \
-H "Content-Type: application/json" \
-d '{"value":"racecar"}'
```

---

## Dependencies

* express
* lowdb
* body-parser
* morgan
* nodemon (dev)
* jest / supertest (optional, for testing)
