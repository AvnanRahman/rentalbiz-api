const pool = require('../config/database');

const createTransaction = async (req, res) => {
  try {
    const { id: id_penyewa } = req.user;
    const { id_barang, tanggal_pinjam, tanggal_kembali, jumlah } = req.body;
    const status = 1;

    // Status 1 = "pending"
    // Status 2 = "sewa"
    // Status 3 = "batal"
    // Status 4 = "selesai"

    // Check if the item exists
    const [rows] = await pool.query('SELECT * FROM items WHERE id = ?', [id_barang]);
    const item = rows[0];
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    // Check if jumlah exceeds stok
    if (jumlah > item.stok) {
      console.log('Insufficient stock');
      res.status(400).json({ message: 'Insufficient stock' });
      return;
    }

    // Calculate the total_harga_sewa
    const total_harga_sewa = item.harga * jumlah;

    // Check time
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

    // Insert the transaction into the database
    const result = await pool.query('INSERT INTO transaction (id_barang, id_penyewa, tanggal_pinjam, tanggal_kembali, jumlah, total_harga_sewa, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', [id_barang, id_penyewa, tanggal_pinjam, tanggal_kembali, jumlah, total_harga_sewa, status, now, now]);

    // Return the newly created transaction
    const createdTransaction = {
      id: result.insertId,
      id_barang,
      id_penyewa,
      tanggal_pinjam,
      tanggal_kembali,
      jumlah,
      total_harga_sewa,
      status
    };

    res.status(201).json(createdTransaction);
  } catch (error) {
    console.error('Failed to create transaction', error);
    res.status(500).json({ message: 'Failed to create transaction' });
  }
};

const getAllTransactions = async (req, res) => {
  try {
    // Check if the authenticated user is an admin
    const { isAdmin } = req.user;
    if (!isAdmin) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Retrieve all transactions from the database
    const [transactions] = await pool.query('SELECT * FROM transaction');

    // const transactions = rows.map(transaction => ({id: transaction.id}));

    res.json({
      success : true,
      message : 'Data semua transaksi didapatkan',
      transactions
    });
  } catch (error) {
    console.error('Failed to retrieve transactions', error);
    res.status(500).json({ message: 'Failed to retrieve transactions' });
  }
};

const getTransactions = async (req, res) => {
  try {
    const { id: id_user } = req.user;

    // Retrieve all transactions by the logged-in user from the database
    const [transactions] = await pool.query('SELECT * FROM transaction WHERE id_penyewa = ?', [id_user]);

    res.json({
      success : true,
      message : 'Data transaksi user didapatkan',
      transactions
    });
  } catch (error) {
    console.error('Failed to retrieve transactions', error);
    res.status(500).json({ message: 'Failed to retrieve transactions' });
  }
};

const getTransactionById = async (req, res) => {
  try {
    const { id } = req.params;
    const { id: id_user } = req.user;

    // Retrieve the transaction from the database
    const [rows] = await pool.query('SELECT * FROM transaction WHERE id = ?', [id]);
    const transaction = rows[0];

    // Check if the transaction exists
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // Check if the id_penyewa of the item matches the logged-in user's id_penyewa
    if (transaction.id_penyewa !== id_user) {
      return res.status(403).json({ error: 'Access denied, you do not have access view this transaction' });
    }

    res.json({ 
      success : true,
      message: 'Transaction data obtained',
      transaction 
    });
  } catch (error) {
    console.error('Failed to retrieve transaction', error);
    res.status(500).json({ message: 'Failed to retrieve transaction' });
  }
};

const updateTransactionById = async (req, res) => {
  try {
    const { id } = req.params;
    const { id: id_user } = req.user;
    const { tanggal_pinjam, tanggal_kembali, jumlah, status } = req.body;

    // Perform validation on the request data if needed

    // Update the transaction in the database
    const [rows] = await pool.query('SELECT * FROM transaction WHERE id = ?', [id]);
    const transaction = rows[0];

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    if (transaction.id_penyewa !== id_user) {
      return res.status(403).json({ error: 'Access denied, you do not have access update this transaction' });
    }

    // Retrieve the item's harga from the items table
    const [[{harga, stok}]] = await pool.query('SELECT harga, stok FROM items WHERE id = ?', [transaction.id_barang]);

  // Check if the status is "sewa" (2) and if jumlah exceeds stok
  if (status === 2 && jumlah > stok) {
    console.log('Insufficient stock');
    res.status(400).json({ message: 'Insufficient stock' });
    return;
  }

    // Calculate the total_harga_sewa
    const total_harga_sewa = harga * jumlah;

    // Check time
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

    await pool.query('UPDATE transaction SET tanggal_pinjam = ?, tanggal_kembali = ?, jumlah = ?, total_harga_sewa = ?, status = ?, updated_at = ? WHERE id = ?', [tanggal_pinjam, tanggal_kembali, jumlah, total_harga_sewa, status, now, id]);

    // Adjust the item's stock based on the updated status
    if (status === 2) {
      // If status is "sewa" (2), reduce the item's stock by the updated jumlah
      await pool.query('UPDATE items SET stok = stok - ? WHERE id = ?', [jumlah, transaction.id_barang]);
    } else if (status === 3 || status === 4) {
      // If status is "batal" (3) or "selesai" (4), increase the item's stock by the updated jumlah
      await pool.query('UPDATE items SET stok = stok + ? WHERE id = ?', [jumlah, transaction.id_barang]);
    }

    res.json({ 
      success : true,
      message: 'Transaction updated successfully' 
    });
  } catch (error) {
    console.error('Failed to update transaction', error);
    res.status(500).json({ message: 'Failed to update transaction' });
  }
};

const deleteTransactionById = async (req, res) => {
  try {
    const { id } = req.params;
    const { id: id_user } = req.user;

    // Delete the transaction from the database
    const [rows]= await pool.query('SELECT * FROM transaction WHERE id = ? AND id_penyewa = ?', [id, id_user]);
    const transaction = rows[0];

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // Check if the transaction's status is 1 (pending)
    if (transaction.status !== 1) {
      return res.status(403).json({ error: 'Cannot delete transactions with status other than pending' });
    }

    // Delete the item
    await pool.query('DELETE FROM transaction WHERE id = ?', [id]);

    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Failed to delete transaction', error);
    res.status(500).json({ message: 'Failed to delete transaction' });
  }
};

module.exports = {
  createTransaction,
  getAllTransactions,
  getTransactions,
  getTransactionById,
  updateTransactionById,
  deleteTransactionById
};
