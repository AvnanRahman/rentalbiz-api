// src/controllers/loginController.js

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Retrieve the user from the database
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    const user = rows[0];

    // Check if the user exists
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Compare the password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate a JWT token with user role and isAdmin flag
    const token = jwt.sign({ userId: user.id, isAdmin: user.isAdmin }, process.env.JWT_SECRET);

    res.json({ token });
  } catch (error) {
    console.error('Failed to login', error);
    res.status(500).json({ error: 'Failed to login' });
  }
};

module.exports = { login };