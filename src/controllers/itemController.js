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
    const { nama, deskripsi, harga, kategori, imageUrl, persyaratan, tersedia, stok } = req.body;

    // Insert the item into the database
    const connection = await pool.getConnection();
    const query = 'INSERT INTO items (nama, deskripsi, harga, kategori, imageUrl, persyaratan, tersedia, stok) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
    await connection.query(query, [nama, deskripsi, harga, kategori, imageUrl, persyaratan, true, stok]);
    connection.release();

    res.status(201).json({ message: 'Item added successfully' });
  } catch (error) {
    console.error('Failed to add item', error);
    res.status(500).json({ error: error.sqlMessage || 'Failed to add item' });
  }
};

// const getItemsByCategory = async (req, res) => {
//   try {
//     const { category } = req.params;

//     // Retrieve items from the database by category
//     const [rows] = await pool.query('SELECT * FROM items WHERE kategori = ?', [category]);
//     const items = rows;

//     res.json(items);
//   } catch (error) {
//     console.error('Failed to retrieve items', error);
//     res.status(500).json({ error: 'Failed to retrieve items' });
//   }
// };

// const getItemsByPriceRange = async (req, res) => {
//   try {
//     const { minPrice, maxPrice } = req.query;

//     const [rows] = await pool.query('SELECT * FROM items WHERE harga >= ? AND harga <= ?', [minPrice, maxPrice]);
//     const items = rows;

//     res.json(items);
//   } catch (error) {
//     console.error('Failed to retrieve items', error);
//     res.status(500).json({ error: 'Failed to retrieve items' });
//   }
// };

// const getItemsByCategoryAndPriceRange = async (req, res) => {
//   try {
//     const { category, minPrice, maxPrice } = req.query;

//     const [rows] = await pool.query(
//       'SELECT * FROM items WHERE kategori = ? AND harga >= ? AND harga <= ?',
//       [category, minPrice, maxPrice]
//     );
//     const items = rows;

//     res.json(items);
//   } catch (error) {
//     console.error('Failed to retrieve items', error);
//     res.status(500).json({ error: 'Failed to retrieve items' });
//   }
// };
  
  module.exports = { getItems, addItem, 
    //getItemsByCategory, getItemsByPriceRange, getItemsByCategoryAndPriceRange 
  };
  