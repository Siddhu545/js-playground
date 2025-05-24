import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import bodyParser from 'body-parser';
import { detectDeadElements } from './index.js';

const app = express();
app.use(bodyParser.json());
app.post('/functions/detectDeadElements', detectDeadElements);

describe('detectDeadElements Function', () => {
  jest.setTimeout(20000); // Puppeteer may take longer

  it('returns hidden elements from a real page', async () => {
    const res = await request(app)
      .post('/functions/detectDeadElements')
      .send({ input: 'https://example.com' });

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.output)).toBe(true);
  });

  it('returns 400 for an invalid URL', async () => {
    const res = await request(app)
      .post('/functions/detectDeadElements')
      .send({ input: 'not-a-url' });

    expect(res.statusCode).toBe(400);
  });
});
