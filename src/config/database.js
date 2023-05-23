// src/config/database.js

const mysql = require('mysql2/promise');
require('dotenv').config();

// Create a connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});


// Create a user table if it doesn't exist
pool.query(`CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  address VARCHAR(255) NOT NULL,
  isAdmin BOOLEAN DEFAULT false
)`).catch(error => console.error('Failed to create users table', error));

// Create a item table if it doesn't exist
pool.query(`CREATE TABLE IF NOT EXISTS items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nama VARCHAR(255) NOT NULL,
  deskripsi TEXT,
  harga INT NOT NULL,
  kategori VARCHAR(255) NOT NULL,
  imageUrl VARCHAR(255) NOT NULL,
  persyaratan TEXT,
  tersedia BOOLEAN NOT NULL,
  stok INT NOT NULL,
  totalSewa INT DEFAULT 0
)`).catch(error => console.error('Failed to create items table', error));

module.exports = pool;