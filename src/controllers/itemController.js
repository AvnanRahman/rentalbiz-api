// itemController.js
const pool = require('../config/database');

const getItems = async (req, res) => {
  try {
    const { name, category, minPrice, maxPrice, city, tersedia } = req.query;

    let query = `
    SELECT i.*, u.city
    FROM items AS i
    INNER JOIN users AS u ON i.id_penyedia = u.id
    WHERE 1=1
    `;
    const params = [];


    // Add name filter
    if (name) {
      query += ' AND i.nama LIKE ?';
      params.push(`%${name}%`);
    }

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

    // Add tersedia filter
    if (tersedia !== undefined) {
      query += ' AND i.tersedia = ?';
      params.push(tersedia === 'true' || tersedia === '1' || tersedia === 'true');
    }

    // Execute the query
    const [rows] = await pool.query(query, params);
    const items = rows;

    res.json({ 
      success : true,
      message : 'Data item didapatkan',
      items 
    });
  } catch (error) {
    console.error('Failed to retrieve items', error);
    // res.status(500).json({ error: 'Failed to retrieve items' });
    res.status(500).json({
      success : false,
      message : error.message
    })
  }
};

// Add an item
const addItem = async (req, res) => {
  try {
    const { id } = req.user;
    const { nama, deskripsi, harga, kategori, imageUrl, persyaratan, tersedia, stok } = req.body;

    // Check time
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

    // Insert the item into the database
    const connection = await pool.getConnection();
    const query = 'INSERT INTO items (nama, id_penyedia, deskripsi, harga, kategori, imageUrl, persyaratan, tersedia, stok, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    await connection.query(query, [nama, id, deskripsi, harga, kategori, imageUrl, persyaratan, true, stok, now, now]);
    connection.release();

    res.status(201).json({ message: 'Item added successfully' });
  } catch (error) {
    console.error('Failed to add item', error);
    res.status(500).json({ error: error.sqlMessage || 'Failed to add item' });
  }
};

const updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama, deskripsi, harga, kategori, imageUrl, persyaratan, tersedia, stok } = req.body;

    // Check time
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

    // Check if the item exists
    const [rows] = await pool.query('SELECT * FROM items WHERE id = ?', [id]);
    const item = rows[0];
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    // Update the item
    await pool.query('UPDATE items SET nama = ?, deskripsi = ?, harga = ?, kategori = ?, imageUrl = ?, persyaratan = ?, tersedia = ?, stok = ?, updated_at = ? WHERE id = ?', [nama, deskripsi, harga, kategori, imageUrl, persyaratan, tersedia, stok, now, id]);

    res.json({ message: 'Item updated successfully' });
  } catch (error) {
    console.error('Failed to update item', error);
    res.status(500).json({ error: 'Failed to update item' });
  }
};

const deleteItem = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if the item exists
    const [rows] = await pool.query('SELECT * FROM items WHERE id = ?', [id]);
    const item = rows[0];
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    // Delete the item
    await pool.query('DELETE FROM items WHERE id = ?', [id]);

    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Failed to delete item', error);
    res.status(500).json({ error: 'Failed to delete item' });
  }
};
  
  module.exports = { getItems, addItem, updateItem, deleteItem };
  