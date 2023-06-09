// itemController.js
const fs = require('fs');
const { Storage } = require('@google-cloud/storage');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const storage = new Storage({
  projectId: process.env.PROJECT_ID,
  keyFilename: '././service-account.json', // Path to your service account key JSON file
});

const bucketName = process.env.BUCKET_NAME; // Replace with your Google Cloud Storage bucket name


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
    const { nama, deskripsi, harga, kategori, persyaratan, tersedia, stok } = req.body;
    const imageFile = req.file;

    // Check if an image file was provided
    if (!imageFile) {
      return res.status(400).json({ error: 'Image file is required' });
    }

    // Upload the image file to Google Cloud Storage
    const bucket = storage.bucket(bucketName);
    const filename = `${uuidv4()}${path.extname(imageFile.originalname)}`;
    const file = bucket.file(filename);
    const filePath = path.join(__dirname, '../uploads/', imageFile.filename);

    // Upload the local file to the bucket
    await bucket.upload(filePath, {
      destination: filename,
      metadata: {
        contentType: imageFile.mimetype,
      },
    });


    // Generate the image URL
    const imageUrl = `https://storage.googleapis.com/${bucketName}/${filename}`;

    // Remove the temporary file from the local filesystem
    fs.unlinkSync(filePath);


    // Check time
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

    // Insert the item into the database
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      const query = 'INSERT INTO items (nama, id_penyedia, deskripsi, harga, kategori, imageUrl, persyaratan, tersedia, stok, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
      await connection.query(query, [nama, id, deskripsi, harga, kategori, imageUrl, persyaratan, true, stok, now, now]);

      await connection.commit();

      res.status(201).json({ message: 'Item added successfully' });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Failed to add item', error);
    res.status(500).json({ error: error.sqlMessage || 'Failed to add item' });
  }
};

const getItemById = async (req, res) => {
  try {
    const { id } = req.params;

    // Retrieve the item from the database
    const [rows] = await pool.query('SELECT * FROM items WHERE id = ?', [id]);
    const item = rows[0];

    // Check if the item exists
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.json({ item });
  } catch (error) {
    console.error('Failed to get item', error);
    res.status(500).json({ error: 'Failed to get item' });
  }
};

const updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { id: id_penyedia } = req.user;
    const imageFile = req.file;
    const { nama, deskripsi, harga, kategori, persyaratan, tersedia, stok } = req.body;

    // Check time
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

    // Check if the item exists
    const [rows] = await pool.query('SELECT * FROM items WHERE id = ?', [id]);
    const item = rows[0];
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    // Check if the id_penyedia of the item matches the logged-in user's id_penyedia
    if (item.id_penyedia !== id_penyedia) {
      return res.status(403).json({ error: 'Access denied, you do not have access to edit this item' });
    }

    // Construct the update query dynamically
    let updateQuery = 'UPDATE items SET';
    const updateParams = [];

    if (nama) {
      updateQuery += ' nama = ?,';
      updateParams.push(nama);
    }

    if (deskripsi) {
      updateQuery += ' deskripsi = ?,';
      updateParams.push(deskripsi);
    }

    if (harga) {
      updateQuery += ' harga = ?,';
      updateParams.push(harga);
    }

    if (kategori) {
      updateQuery += ' kategori = ?,';
      updateParams.push(kategori);
    }

    if (persyaratan) {
      updateQuery += ' persyaratan = ?,';
      updateParams.push(persyaratan);
    }

    if (tersedia !== undefined) {
      updateQuery += ' tersedia = ?,';
      updateParams.push(tersedia);
    }

    if (stok !== undefined) {
      updateQuery += ' stok = ?,';
      updateParams.push(stok);
    }

    updateQuery += ' updated_at = ? WHERE id = ?';
    updateParams.push(new Date().toISOString().slice(0, 19).replace('T', ' '), id);

    // Execute the update query
    await pool.query(updateQuery, updateParams);


    res.json({ 
      success : true,
      message: 'Item updated successfully',
      updateQuery,
      updateParams
    });
  } catch (error) {
    console.error('Failed to update item', error);
    res.status(500).json({
      success : false,
      message : error.message
    });
  }
};

const deleteItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { id: id_penyedia } = req.user;

    // Check if the item exists
    const [rows] = await pool.query('SELECT * FROM items WHERE id = ? AND id_penyedia = ?', [id, id_penyedia]);
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
  
  module.exports = { getItems, addItem, getItemById, updateItem, deleteItem };
  