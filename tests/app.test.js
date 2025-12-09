const request = require('supertest');
const app = require('../src/app');

describe('App Health and Basic Routes', () => {
  // Test: GET / - Root endpoint
  describe('GET /', () => {
    it('should return API information', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      expect(response.body).toHaveProperty('message', 'E-Shopping Management System API');
      expect(response.body).toHaveProperty('status', 'running');
    });
  });

  // Test: GET /health - Health check
  describe('GET /health', () => {
    it('should return healthy status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  // Test: 404 handler
  describe('GET /non-existent-route', () => {
    it('should return 404 for non-existent routes', async () => {
      const response = await request(app)
        .get('/non-existent-route')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Route not found');
    });
  });
});