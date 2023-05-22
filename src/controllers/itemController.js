// itemController.js
const pool = require('../config/database');

const  getItems = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM items');
    res.json(rows);
  } catch (error) {
    console.error('Failed to retrieve items', error);
    res.status(500).json({ error: 'Failed to retrieve items' });
  } 
};

// Add an item
const addItem = async (req, res) => {
  try {
    const { nama, deskripsi, harga, imageUrl, persyaratan, tersedia, stok } = req.body;

    // Insert the item into the database
    const connection = await pool.getConnection();
    const query = 'INSERT INTO items (nama, deskripsi, harga, imageUrl, persyaratan, tersedia, stok) VALUES (?, ?, ?, ?, ?, ?, ?)';
    await connection.query(query, [nama, deskripsi, harga, imageUrl, persyaratan, true, stok]);
    connection.release();

    res.status(201).json({ message: 'Item added successfully' });
  } catch (error) {
    console.error('Failed to add item', error);
    res.status(500).json({ error: 'Failed to add item' });
  }
};
  

  
  module.exports = { getItems, addItem };
  