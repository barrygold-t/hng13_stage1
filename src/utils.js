const crypto = require('crypto');

function sha256(value) {
  return crypto.createHash('sha256').update(value, 'utf8').digest('hex');
}

function analyzeString(value) {
  // properties:
  // length, is_palindrome (case-insensitive), unique_characters, word_count, sha256_hash, character_frequency_map
  const length = [...value].length; // counts characters (including spaces)
  const normalized = value.toLowerCase();
  const alphanumericOnly = normalized.replace(/\s+/g, ''); // palindrome check uses characters including punctuation per spec? Spec is ambiguous; we'll use full string but case-insensitive and keep spaces.
  // Palindrome: case-insensitive, compare full string ignoring case and spaces? Spec said case-insensitive only.
  const is_palindrome = normalized === [...normalized].reverse().join('');
  const charFreq = {};
  for (const ch of value) {
    charFreq[ch] = (charFreq[ch] || 0) + 1;
  }
  const unique_characters = Object.keys(charFreq).length;
  const word_count = value.trim() === '' ? 0 : value.trim().split(/\s+/).length;
  const sha256_hash = sha256(value);
  return {
    length,
    is_palindrome,
    unique_characters,
    word_count,
    sha256_hash,
    character_frequency_map: charFreq
  };
}

function applyFilters(strings, filters) {
  // filters: { is_palindrome, min_length, max_length, word_count, contains_character }
  return strings.filter(item => {
    const p = item.properties;
    if (filters.is_palindrome !== undefined) {
      if (String(p.is_palindrome) !== String(filters.is_palindrome)) return false;
    }
    if (filters.min_length !== undefined) {
      if (p.length < Number(filters.min_length)) return false;
    }
    if (filters.max_length !== undefined) {
      if (p.length > Number(filters.max_length)) return false;
    }
    if (filters.word_count !== undefined) {
      if (p.word_count !== Number(filters.word_count)) return false;
    }
    if (filters.contains_character !== undefined) {
      if (!Object.prototype.hasOwnProperty.call(p.character_frequency_map, filters.contains_character)) return false;
    }
    return true;
  });
}

// Very simple natural language parser for the example queries in spec
function parseNaturalLanguageQuery(q) {
  if (!q || q.trim() === '') throw new Error('Empty query');
  const original = q;
  q = q.toLowerCase();

  const parsed = {};
  // "single word palindromic strings" => word_count=1, is_palindrome=true
  if (/\bsingle word\b|\bone word\b/.test(q) || /\b(single|one)\b.*\bword\b/.test(q)) {
    parsed.word_count = 1;
  }
  if (/\bpalindrom(e|ic|romic)\b|\bpalindromic\b/.test(q) || /\bpalindrome\b/.test(q)) {
    parsed.is_palindrome = true;
  }
  const longerThanMatch = q.match(/longer than (\d+)|greater than (\d+)|more than (\d+)/);
  if (longerThanMatch) {
    const num = Number(longerThanMatch[1] || longerThanMatch[2] || longerThanMatch[3]);
    parsed.min_length = num + 1;
  }
  const longerOrEqual = q.match(/at least (\d+)|>=\s*(\d+)/);
  if (longerOrEqual) {
    parsed.min_length = Number(longerOrEqual[1] || longerOrEqual[2]);
  }
  const containsLetter = q.match(/contain(s|ing)? the (letter )?([a-z])/);
  if (containsLetter) {
    parsed.contains_character = containsLetter[3];
  } else {
    // "strings containing the letter z" or "containing letter z"
    const containAny = q.match(/contain(s|ing)? (the )?(letter )?([a-z])/);
    if (containAny) parsed.contains_character = containAny[4];
  }

  // "strings containing the letter z" fallback
  const containsCharWord = q.match(/containing.*\b([a-z])\b/);
  if (containsCharWord && !parsed.contains_character) {
    parsed.contains_character = containsCharWord[1];
  }

  if (Object.keys(parsed).length === 0) {
    throw new Error('Unable to parse natural language query');
  }

  return { original, parsed_filters: parsed };
}

module.exports = {
  analyzeString,
  sha256,
  applyFilters,
  parseNaturalLanguageQuery
};
