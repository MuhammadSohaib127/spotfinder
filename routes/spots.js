const express = require('express');
const router = express.Router();
const { CosmosClient } = require('@azure/cosmos');
require('dotenv').config();

const client = new CosmosClient({
  endpoint: process.env.COSMOS_ENDPOINT,
  key: process.env.COSMOS_KEY
});

const database = client.database(process.env.COSMOS_DATABASE);
const container = database.container(process.env.COSMOS_CONTAINER);

// GET /spots - get all spots
router.get('/', async (req, res) => {
  try {
    const { resources } = await container.items.readAll().fetchAll();
    res.json(resources);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /spots - report a new spot
router.post('/', async (req, res) => {
  try {
    const spot = {
      id: 'spot-' + Date.now(),
      reporterId: req.body.reporterId || 'anonymous',
      spotType: req.body.spotType || 'free',
      wardenSighted: req.body.wardenSighted || false,
      location: req.body.location,
      address: req.body.address || '',
      availableFor: req.body.availableFor || 30,
      reportedAt: new Date().toISOString(),
      trustScore: 0.8
    };
    const { resource } = await container.items.create(spot);
    res.status(201).json(resource);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /spots/:id - get a single spot
router.get('/:id', async (req, res) => {
  try {
    const { resource } = await container.item(req.params.id, req.params.id).read();
    if (!resource) return res.status(404).json({ error: 'Spot not found' });
    res.json(resource);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /spots/:id - delete a spot
router.delete('/:id', async (req, res) => {
  try {
    await container.item(req.params.id, req.params.id).delete();
    res.json({ message: 'Spot deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;