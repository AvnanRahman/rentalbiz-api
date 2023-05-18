// src/controllers/registerController.js

const bcrypt = require('bcrypt');
const pool = require('../config/database');

async function register(req, res) {
  try {
    const { email, password, name, address } = req.body;

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the user into the database
    await pool.query('INSERT INTO users (email, password, name, address) VALUES (?, ?, ?, ?)', [email, hashedPassword, name, address]);

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Failed to register user', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
}

module.exports = {
  register
};
