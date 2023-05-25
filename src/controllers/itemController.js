// itemController.js
const pool = require('../config/database');

const getItems = async (req, res) => {
  try {
    const { category, minPrice, maxPrice, city } = req.query;

    let query = `
    SELECT i.*, u.city
    FROM items AS i
    INNER JOIN users AS u ON i.id_penyedia = u.id
    WHERE 1=1
    `;
    const params = [];

    // Add category filter
    if (category) {
      query += ' AND i.kategori = ?';
      params.push(category);
    }

    // Add price range filter
    if (minPrice && maxPrice) {
      query += ' AND i.harga >= ? AND i.harga <= ?';
      params.push(minPrice, maxPrice);
    } else if (minPrice) {
      query += ' AND i.harga >= ?';
      params.push(minPrice);
    } else if (maxPrice) {
      query += ' AND i.harga <= ?';
      params.push(maxPrice);
    }

      // Add city filter
      if (city) {
        query += ' AND u.city = ?';
        params.push(city);
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
  