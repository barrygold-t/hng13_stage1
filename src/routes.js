const express = require('express');
const router = express.Router();
const store = require('./store');
const { analyzeString, applyFilters, parseNaturalLanguageQuery } = require('./utils');

(async () => {
  await store.init();
})();

// POST /strings
router.post('/', async (req, res, next) => {
  try {
    if (!req.body || !Object.prototype.hasOwnProperty.call(req.body, 'value')) {
      return res.status(400).json({ error: '"value" field is required' });
    }
    const { value } = req.body;
    if (typeof value !== 'string') return res.status(422).json({ error: '"value" must be a string' });

    const existing = await store.findByValue(value);
    if (existing) return res.status(409).json({ error: 'String already exists' });

    const props = analyzeString(value);
    const now = new Date().toISOString();
    const record = {
      id: props.sha256_hash,
      value,
      properties: props,
      created_at: now
    };
    await store.saveString(record);
    res.status(201).json(record);
  } catch (err) {
    next(err);
  }
});

// ✅ Move this route above /:string_value
// GET /strings/filter-by-natural-language?query=...
router.get('/filter-by-natural-language', async (req, res, next) => {
  try {
    const q = req.query.query;
    if (!q) return res.status(400).json({ error: 'query param is required' });

    let parsed;
    try {
      parsed = parseNaturalLanguageQuery(q);
    } catch (err) {
      return res.status(400).json({ error: err.message || 'Unable to parse natural language query' });
    }

    const all = await store.getAllStrings();
    const filtered = applyFilters(all, parsed.parsed_filters);
    res.json({
      data: filtered,
      count: filtered.length,
      interpreted_query: {
        original: parsed.original,
        parsed_filters: parsed.parsed_filters
      }
    });
  } catch (err) {
    next(err);
  }
});

// GET /strings/:string_value
router.get('/:string_value', async (req, res, next) => {
  try {
    const value = req.params.string_value;
    const decoded = decodeURIComponent(value);
    const entry = await store.findByValue(decoded);
    if (!entry) return res.status(404).json({ error: 'String does not exist' });
    res.json(entry);
  } catch (err) {
    next(err);
  }
});

// DELETE /strings/:string_value
router.delete('/:string_value', async (req, res, next) => {
  try {
    const decoded = decodeURIComponent(req.params.string_value);
    const removed = await store.deleteByValue(decoded);
    if (!removed) return res.status(404).json({ error: 'String does not exist' });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

// GET /strings (with filters)
router.get('/', async (req, res, next) => {
  try {
    const { is_palindrome, min_length, max_length, word_count, contains_character } = req.query;
    const filters = {};
    if (is_palindrome !== undefined) {
      if (!(is_palindrome === 'true' || is_palindrome === 'false')) {
        return res.status(400).json({ error: 'is_palindrome must be true or false' });
      }
      filters.is_palindrome = is_palindrome === 'true';
    }
    if (min_length !== undefined) {
      if (isNaN(Number(min_length))) return res.status(400).json({ error: 'min_length must be integer' });
      filters.min_length = Number(min_length);
    }
    if (max_length !== undefined) {
      if (isNaN(Number(max_length))) return res.status(400).json({ error: 'max_length must be integer' });
      filters.max_length = Number(max_length);
    }
    if (word_count !== undefined) {
      if (isNaN(Number(word_count))) return res.status(400).json({ error: 'word_count must be integer' });
      filters.word_count = Number(word_count);
    }
    if (contains_character !== undefined) {
      if (typeof contains_character !== 'string' || [...contains_character].length !== 1) {
        return res.status(400).json({ error: 'contains_character must be a single character' });
      }
      filters.contains_character = contains_character;
    }

    const all = await store.getAllStrings();
    const data = applyFilters(all, filters);
    res.json({ data, count: data.length, filters_applied: filters });
  } catch (err) {
    next(err);
  }
});

module.exports = router;