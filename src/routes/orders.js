const express = require('express');
const router = express.Router();
const db = require('../models/database');

// Get all orders
router.get('/', (req, res) => {
  const sql = `
    SELECT orders.*, products.name as product_name 
    FROM orders 
    LEFT JOIN products ON orders.product_id = products.id 
    ORDER BY orders.created_at DESC
  `;
  
  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ orders: rows, count: rows.length });
  });
});

// Get order by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const sql = `
    SELECT orders.*, products.name as product_name 
    FROM orders 
    LEFT JOIN products ON orders.product_id = products.id 
    WHERE orders.id = ?
  `;
  
  db.get(sql, [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json({ order: row });
  });
});

// Create new order
router.post('/', (req, res) => {
  const { customer_name, customer_email, product_id, quantity } = req.body;
  
  if (!customer_name || !customer_email || !product_id || !quantity) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  // Check if product exists and has enough stock
  db.get('SELECT * FROM products WHERE id = ?', [product_id], (err, product) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    if (product.stock < quantity) {
      return res.status(400).json({ error: 'Insufficient stock' });
    }

    const total_price = product.price * quantity;
    const sql = 'INSERT INTO orders (customer_name, customer_email, product_id, quantity, total_price) VALUES (?, ?, ?, ?, ?)';
    
    db.run(sql, [customer_name, customer_email, product_id, quantity, total_price], function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      // Update product stock
      db.run('UPDATE products SET stock = stock - ? WHERE id = ?', [quantity, product_id]);

      res.status(201).json({ 
        message: 'Order created successfully',
        order: { 
          id: this.lastID, 
          customer_name, 
          customer_email, 
          product_id, 
          quantity, 
          total_price 
        }
      });
    });
  });
});

// Update order status
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  db.run('UPDATE orders SET status = ? WHERE id = ?', [status, id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json({ message: 'Order status updated successfully' });
  });
});

// Delete order
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM orders WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json({ message: 'Order deleted successfully' });
  });
});

module.exports = router;