// adminController.js
const bcrypt = require('bcrypt');
const pool = require('../config/database');

const addAdmin = async (req, res) => {
    try {
      // Check if the authenticated user is an admin
      const { isAdmin } = req.user;
      if (!isAdmin) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      // Get the user data from the request body
      const { name, email, password, address, city, phone } = req.body;
  
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Add the user as admin
      await pool.query('INSERT INTO users (name, email, password, address, city, phone, isAdmin) VALUES (?, ?, ?, ?, ?, ?, ?)', [name, email, hashedPassword, address, city, phone, true]);
  
      res.status(201).json({ message: 'Admin user added successfully' });
    } catch (error) {
      console.error('Failed to add admin user', error);
      res.status(500).json({ error: error.sqlMessage || 'Failed to add admin user' });
    }
  };
  
  const listUsers = async (req, res) => {
    try {

      // Check if the authenticated user is an admin
      const { isAdmin } = req.user;
      if (!isAdmin) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      // Retrieve all users from the database
      const [rows] = await pool.query('SELECT * FROM users');
  
      // Exclude password field from the response
      const users = rows.map(user => ({ id: user.id, name: user.name, email: user.email, address: user.address, city: user.city, phone: user.phone, isAdmin: user.isAdmin, created_at: user.created_at }));
  
      res.json(users);
    } catch (error) {
      console.error('Failed to retrieve users', error);
      res.status(500).json({ error: 'Failed to retrieve users' });
    }
  };
  
  module.exports = { addAdmin, listUsers };
  