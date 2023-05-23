// src/controllers/registerController.js

const bcrypt = require('bcrypt');
const pool = require('../config/database');

const register = async (req, res) => {
    try {
      const { name, email, password, address, phone,  isAdmin } = req.body;
  
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Check if the registering user is the first user (admin)
      const [existingUsers] = await pool.query('SELECT * FROM users');
      const isFirstUser = existingUsers.length === 0;
  
      // Set isAdmin based on isFirstUser condition
      const userRole = isFirstUser ? true : isAdmin;
  
      // Insert the user into the database with the specified role
      await pool.query('INSERT INTO users (name, email, password, address, phone, isAdmin) VALUES (?, ?, ?, ?, ?, ?)', [name, email, hashedPassword ,address, phone, userRole]);
  
      res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
      console.error('Failed to register user', error);
      res.status(500).json({ error: 'Failed to register user' });
    }
  };
  
  module.exports = { register };