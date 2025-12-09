const request = require('supertest');
const app = require('../src/app');

describe('Orders API', () => {
  let productId;
  let orderId;

  // Create a product first (needed for orders)
  beforeAll(async () => {
    const product = {
      name: 'Order Test Product',
      description: 'Product for order testing',
      price: 99.99,
      stock: 50,
      category: 'Test'
    };

    const response = await request(app)
      .post('/api/products')
      .send(product);

    productId = response.body.product.id;
  });

  // Test: GET /api/orders - Get all orders
  describe('GET /api/orders', () => {
    it('should return all orders', async () => {
      const response = await request(app)
        .get('/api/orders')
        .expect(200);

      expect(response.body).toHaveProperty('orders');
      expect(Array.isArray(response.body.orders)).toBe(true);
    });
  });

  // Test: POST /api/orders - Create order
  describe('POST /api/orders', () => {
    it('should create a new order', async () => {
      const newOrder = {
        customer_name: 'John Doe',
        customer_email: 'john@example.com',
        product_id: productId,
        quantity: 2
      };

      const response = await request(app)
        .post('/api/orders')
        .send(newOrder)
        .expect(201);

      expect(response.body).toHaveProperty('message', 'Order created successfully');
      expect(response.body.order).toHaveProperty('id');
      expect(response.body.order.total_price).toBe(99.99 * 2);

      orderId = response.body.order.id;
    });

    it('should fail to create order without required fields', async () => {
      const invalidOrder = {
        customer_name: 'Jane Doe'
      };

      const response = await request(app)
        .post('/api/orders')
        .send(invalidOrder)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should fail to create order for non-existent product', async () => {
      const invalidOrder = {
        customer_name: 'Jane Doe',
        customer_email: 'jane@example.com',
        product_id: 99999,
        quantity: 1
      };

      const response = await request(app)
        .post('/api/orders')
        .send(invalidOrder)
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Product not found');
    });

    it('should fail to create order with insufficient stock', async () => {
      const invalidOrder = {
        customer_name: 'Jane Doe',
        customer_email: 'jane@example.com',
        product_id: productId,
        quantity: 1000
      };

      const response = await request(app)
        .post('/api/orders')
        .send(invalidOrder)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Insufficient stock');
    });
  });

  // Test: GET /api/orders/:id - Get order by ID
  describe('GET /api/orders/:id', () => {
    it('should return a specific order', async () => {
      const response = await request(app)
        .get(`/api/orders/${orderId}`)
        .expect(200);

      expect(response.body).toHaveProperty('order');
      expect(response.body.order.customer_name).toBe('John Doe');
    });

    it('should return 404 for non-existent order', async () => {
      const response = await request(app)
        .get('/api/orders/99999')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Order not found');
    });
  });

  // Test: PUT /api/orders/:id - Update order status
  describe('PUT /api/orders/:id', () => {
    it('should update order status', async () => {
      const response = await request(app)
        .put(`/api/orders/${orderId}`)
        .send({ status: 'processing' })
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Order status updated successfully');
    });

    it('should fail with invalid status', async () => {
      const response = await request(app)
        .put(`/api/orders/${orderId}`)
        .send({ status: 'invalid_status' })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Invalid status');
    });
  });

  // Test: DELETE /api/orders/:id - Delete order
  describe('DELETE /api/orders/:id', () => {
    it('should delete an order', async () => {
      const response = await request(app)
        .delete(`/api/orders/${orderId}`)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Order deleted successfully');
    });
  });
});