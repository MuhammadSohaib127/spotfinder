const express = require('express');
const router = express.Router();
const { BlobServiceClient } = require('@azure/storage-blob');
require('dotenv').config();

const blobServiceClient = BlobServiceClient.fromConnectionString(
  process.env.STORAGE_CONNECTION_STRING
);
const containerClient = blobServiceClient.getContainerClient(
  process.env.STORAGE_CONTAINER
);

// POST /upload - upload a file to blob storage
router.post('/', async (req, res) => {
  try {
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', async () => {
      const buffer = Buffer.concat(chunks);
      const filename = `spot-${Date.now()}-${req.headers['x-filename'] || 'file'}`;
      const blockBlobClient = containerClient.getBlockBlobClient(filename);
      await blockBlobClient.upload(buffer, buffer.length, {
        blobHTTPHeaders: { blobContentType: req.headers['content-type'] }
      });
      const url = blockBlobClient.url;
      res.status(201).json({ url, filename });
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /upload - list all uploaded files
router.get('/', async (req, res) => {
  try {
    const files = [];
    for await (const blob of containerClient.listBlobsFlat()) {
      files.push({
        name: blob.name,
        url: `https://spotfinderstorage.blob.core.windows.net/spotfiles/${blob.name}`,
        size: blob.properties.contentLength
      });
    }
    res.json(files);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.delete('/:filename', async (req, res) => {
  try {
    const blockBlobClient = containerClient.getBlockBlobClient(req.params.filename);
    await blockBlobClient.delete();
    res.json({ message: 'File deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
module.exports = router;