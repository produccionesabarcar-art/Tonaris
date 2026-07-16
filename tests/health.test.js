const request = require('supertest');

const app = require('../src/app');

describe('GET /health', () => {
  it('responde con 200 y status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok', project: 'Tonaris API' });
  });
});
