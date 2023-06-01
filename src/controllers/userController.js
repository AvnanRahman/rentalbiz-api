const pool = require('../config/database');

const getUserById = async (req, res) => {
    try {
      const { id } = req.params;
  
      // Retrieve the user from the database
      const [rows] = await pool.query('SELECT id, email, name, address, city, phone FROM users WHERE id = ?', [id]);
      const user = rows[0];
  
      // Check if the user exists
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      res.json({ 
        success : true,
        message : 'Data user didapatkan',
        user
     });
    } catch (error) {
      console.error('Failed to retrieve user', error);
      res.status(500).json({ error: 'Failed to retrieve user' });
    }
  };
  
  module.exports = { getUserById };
  