const request = require('supertest');
const app = require('../src/app');

describe('Products API', () => {
  let productId;

  // Test: GET /api/products - Get all products
  describe('GET /api/products', () => {
    it('should return all products', async () => {
      const response = await request(app)
        .get('/api/products')
        .expect(200);

      expect(response.body).toHaveProperty('products');
      expect(Array.isArray(response.body.products)).toBe(true);
    });
  });

  // Test: POST /api/products - Create product
  describe('POST /api/products', () => {
    it('should create a new product', async () => {
      const newProduct = {
        name: 'Test Laptop',
        description: 'High-performance laptop',
        price: 1299.99,
        stock: 15,
        category: 'Electronics'
      };

      const response = await request(app)
        .post('/api/products')
        .send(newProduct)
        .expect(201);

      expect(response.body).toHaveProperty('message', 'Product created successfully');
      expect(response.body.product).toHaveProperty('id');
      expect(response.body.product.name).toBe(newProduct.name);

      // Save product ID for next tests
      productId = response.body.product.id;
    });

    it('should fail to create product without required fields', async () => {
      const invalidProduct = {
        description: 'Missing required fields'
      };

      const response = await request(app)
        .post('/api/products')
        .send(invalidProduct)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  // Test: GET /api/products/:id - Get product by ID
  describe('GET /api/products/:id', () => {
    it('should return a specific product', async () => {
      const response = await request(app)
        .get(`/api/products/${productId}`)
        .expect(200);

      expect(response.body).toHaveProperty('product');
      expect(response.body.product.name).toBe('Test Laptop');
    });

    it('should return 404 for non-existent product', async () => {
      const response = await request(app)
        .get('/api/products/99999')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Product not found');
    });
  });

  // Test: PUT /api/products/:id - Update product
  describe('PUT /api/products/:id', () => {
    it('should update a product', async () => {
      const updatedProduct = {
        name: 'Updated Laptop',
        description: 'Updated description',
        price: 1399.99,
        stock: 20,
        category: 'Electronics'
      };

      const response = await request(app)
        .put(`/api/products/${productId}`)
        .send(updatedProduct)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Product updated successfully');
    });
  });

  // Test: DELETE /api/products/:id - Delete product
  describe('DELETE /api/products/:id', () => {
    it('should delete a product', async () => {
      const response = await request(app)
        .delete(`/api/products/${productId}`)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Product deleted successfully');
    });

    it('should return 404 when deleting non-existent product', async () => {
      const response = await request(app)
        .delete('/api/products/99999')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Product not found');
    });
  });
});