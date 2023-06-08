const express = require('express');
const router = express.Router();
const { Storage } = require('@google-cloud/storage');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Create a new instance of the Cloud Storage client
const storage = new Storage();

// Define the Google Cloud Storage bucket name
const bucketName =  process.env.BUCKET_NAME;

// Create a multer middleware with the desired storage configuration
const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const extension = file.originalname.split('.').pop();
    cb(null, file.fieldname + '-' + uniqueSuffix + '.' + extension);
  },
});

// Create a multer instance with the storage configuration
const upload = multer({ storage: multerStorage });

// POST /upload route to handle the image upload
router.post('/', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Image file is required' });
    }

    const imageFile = req.file;

    // Generate a unique filename for the uploaded image
    const filename = `${uuidv4()}${path.extname(imageFile.originalname)}`;

    // Upload the image file to Google Cloud Storage
    await storage.bucket(bucketName).upload(imageFile.path, {
      destination: filename,
    });

    // Generate the image URL
    const imageUrl = `https://storage.googleapis.com/${bucketName}/${filename}`;

    // Remove the temporary file from the local filesystem
    fs.unlinkSync(imageFile.path);

    res.status(200).json({
      message: 'Image uploaded successfully',
      imageUrl,
    });
  } catch (error) {
    console.error('Failed to upload image', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

module.exports = router;
