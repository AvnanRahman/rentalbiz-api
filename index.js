const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse the request body as JSON
app.use(express.json());

// Create a connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Connect to MySQL
pool.getConnection()
  .then(connection => {
    console.log('Connected to MySQL');
    connection.release();
  })
  .catch(error => console.error('Failed to connect to MySQL', error));

// Create a user table if it doesn't exist
pool.query(`CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(255) NOT NULL
  )`).catch(error => console.error('Failed to create users table', error));

// Register a new user
app.post('/register', async (req, res) => {
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
  });
  

// Login with existing user
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Retrieve the user from the database
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    const user = rows[0];

    // Check if the user exists
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Compare the password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate a JWT token
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);

    res.json({ token });
  } catch (error) {
    console.error('Failed to login', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

app.listen(port, () => console.log(`Server is running on port ${port}`));