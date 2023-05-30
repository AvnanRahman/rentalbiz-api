const jwt = require('jsonwebtoken');
const pool = require('../config/database');
require('dotenv').config();

const isAuthenticated = async (req, res, next) => {
  try {
    // Retrieve the token from the Authorization header
    const token = req.headers.authorization.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Retrieve the user from the database based on the token's userId
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [decoded.userId]);
    const user = rows[0];

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Attach the user object to the request for future use
    req.user = user;

    // User is authenticated, allow access to the next middleware or route handler
    next();
  } catch (error) {
    console.error('Failed to authenticate user', error);
    res.status(500).json({ error: 'Failed to authenticate user' });
  }
};

module.exports = isAuthenticated;