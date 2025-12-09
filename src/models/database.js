const express = require('express');
const router = express.Router();
const db = require('../models/database');

// Get all products
router.get('/', (req, res) => {
  db.all('SELECT * FROM products ORDER BY created_at DESC', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ products: rows, count: rows.length });
  });
});

// Get product by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM products WHERE id = ?', [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ product: row });
  });
});

// Create new product
router.post('/', (req, res) => {
  const { name, description, price, stock, category } = req.body;
  
  if (!name || !price || stock === undefined) {
    return res.status(400).json({ error: 'Name, price, and stock are required' });
  }

  const sql = 'INSERT INTO products (name, description, price, stock, category) VALUES (?, ?, ?, ?, ?)';
  db.run(sql, [name, description, price, stock, category], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ 
      message: 'Product created successfully',
      product: { id: this.lastID, name, description, price, stock, category }
    });
  });
});

// Update product
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { name, description, price, stock, category } = req.body;
  
  const sql = 'UPDATE products SET name = ?, description = ?, price = ?, stock = ?, category = ? WHERE id = ?';
  db.run(sql, [name, description, price, stock, category, id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ message: 'Product updated successfully' });
  });
});

// Delete product
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM products WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully' });
  });
});

module.exports = router;