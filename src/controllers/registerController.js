// src/controllers/registerController.js

const bcrypt = require('bcrypt');
const pool = require('../config/database');

const register = async (req, res) => {
    try {
      const { name, email, password, address, city, phone,  isAdmin } = req.body;

      // Check if the email already exists in the database
      const [existingEmail] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
      if (existingEmail.length > 0) {
        return res.status(400).json({ error: 'Email already exists' });
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Check time
      const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
  
      // Check if the registering user is the first user (admin)
      const [existingUsers] = await pool.query('SELECT * FROM users');
      const isFirstUser = existingUsers.length === 0;
  
      // Set isAdmin based on isFirstUser condition
      const userRole = isFirstUser ? true : isAdmin;
  
      // Insert the user into the database with the specified role
      await pool.query('INSERT INTO users (name, email, password, address, city, phone, isAdmin, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [name, email, hashedPassword ,address, city, phone, userRole, now]);
  
      res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
      console.error('Failed to register user', error);
      res.status(500).json({ error: 'Failed to register user' });
    }
  };
  
  module.exports = { register };