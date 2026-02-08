/**
 * Example Test
 *
 * This is an example test file to demonstrate testing setup.
 */

import request from 'supertest';
import app from '../index';

describe('Health Check API', () => {
  it('should return health status', async () => {
    const response = await request(app.callback())
      .get('/api/health')
      .expect(200);

    expect(response.body).toHaveProperty('success', true);
    expect(response.body.data).toHaveProperty('status', 'ok');
    expect(response.body.data).toHaveProperty('timestamp');
    expect(response.body.data).toHaveProperty('version');
  });

  it('should return API info', async () => {
    const response = await request(app.callback())
      .get('/api/')
      .expect(200);

    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('message', 'PokeTB Forum API');
  });

  it('should return 404 for unknown routes', async () => {
    const response = await request(app.callback())
      .get('/api/unknown')
      .expect(404);

    expect(response.body).toHaveProperty('success', false);
    expect(response.body.error).toHaveProperty('code', 'NOT_FOUND');
  });
});
