const request = require('supertest');
const app = require('../src/server');
const store = require('../src/store');

beforeAll(async () => {
  await store.init();
  await store.clear();
});

afterAll(async () => {
  await store.clear();
});

describe('String Analyzer API', () => {
  test('POST /strings creates and returns analysis', async () => {
    const res = await request(app)
      .post('/strings')
      .send({ value: 'racecar' })
      .set('Accept', 'application/json');
    expect(res.statusCode).toBe(201);
    expect(res.body.value).toBe('racecar');
    expect(res.body.properties.is_palindrome).toBe(true);
    expect(res.body.properties.word_count).toBe(1);
  });

  test('POST same string returns 409', async () => {
    const res = await request(app)
      .post('/strings')
      .send({ value: 'racecar' });
    expect(res.statusCode).toBe(409);
  });

  test('GET /strings?is_palindrome=true returns the palindrome', async () => {
    const res = await request(app).get('/strings?is_palindrome=true');
    expect(res.statusCode).toBe(200);
    expect(res.body.count).toBeGreaterThanOrEqual(1);
  });

  test('GET /strings/filter-by-natural-language query', async () => {
    const res = await request(app).get('/strings/filter-by-natural-language').query({ query: 'single word palindromic strings' });
    expect(res.statusCode).toBe(200);
    expect(res.body.interpreted_query.parsed_filters.is_palindrome).toBe(true);
  });

  test('DELETE /strings/:string_value deletes', async () => {
    const res = await request(app).delete('/strings/racecar');
    expect([204, 200]).toContain(res.statusCode);
  });
});
