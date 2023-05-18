// adminController.js
const bcrypt = require('bcrypt');
const pool = require('../config/database');

const addAdmin = async (req, res) => {
    try {
      // Get the user data from the request body
      const { name, email, password } = req.body;
  
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Add the user as admin
      await pool.query('INSERT INTO users (name, email, password, isAdmin) VALUES (?, ?, ?, ?)', [name, email, hashedPassword, true]);
  
      res.status(201).json({ message: 'Admin user added successfully' });
    } catch (error) {
      console.error('Failed to add admin user', error);
      res.status(500).json({ error: 'Failed to add admin user' });
    }
  };
  
  const listUsers = async (req, res) => {
    try {
      // Retrieve all users from the database
      const [rows] = await pool.query('SELECT * FROM users');
  
      // Exclude password field from the response
      const users = rows.map(user => ({ id: user.id, name: user.name, email: user.email, isAdmin: user.isAdmin }));
  
      res.json(users);
    } catch (error) {
      console.error('Failed to retrieve users', error);
      res.status(500).json({ error: 'Failed to retrieve users' });
    }
  };
  
  module.exports = { addAdmin, listUsers };
  