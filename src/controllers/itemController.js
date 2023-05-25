// itemController.js
const pool = require('../config/database');

const getItems = async (req, res) => {
  try {
    const { category, minPrice, maxPrice } = req.query;

    let query = 'SELECT * FROM items WHERE 1=1';
    const params = [];

    // Add category filter
    if (category) {
      query += ' AND kategori = ?';
      params.push(category);
    }

    // Add price range filter
    if (minPrice && maxPrice) {
      query += ' AND harga >= ? AND harga <= ?';
      params.push(minPrice, maxPrice);
    } else if (minPrice) {
      query += ' AND harga >= ?';
      params.push(minPrice);
    } else if (maxPrice) {
      query += ' AND harga <= ?';
      params.push(maxPrice);
    }

    // Execute the query
    const [rows] = await pool.query(query, params);
    const items = rows;

    res.json({ items });
  } catch (error) {
    console.error('Failed to retrieve items', error);
    res.status(500).json({ error: 'Failed to retrieve items' });
  }
};

// Add an item
const addItem = async (req, res) => {
  try {
    const { nama, id_penyedia, deskripsi, harga, kategori, imageUrl, persyaratan, tersedia, stok } = req.body;

    // Check time
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

    // Insert the item into the database
    const connection = await pool.getConnection();
    const query = 'INSERT INTO items (nama, id_penyedia, deskripsi, harga, kategori, imageUrl, persyaratan, tersedia, stok, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    await connection.query(query, [nama, id_penyedia, deskripsi, harga, kategori, imageUrl, persyaratan, true, stok, now, now]);
    connection.release();

    res.status(201).json({ message: 'Item added successfully' });
  } catch (error) {
    console.error('Failed to add item', error);
    res.status(500).json({ error: error.sqlMessage || 'Failed to add item' });
  }
};

  
  module.exports = { getItems, addItem, };
  