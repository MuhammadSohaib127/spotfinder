const express = require('express');
const cors = require('cors');
require('dotenv').config();

const spotsRouter = require('./routes/spots');
const usersRouter = require('./routes/users');
const uploadRouter = require('./routes/upload');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.get('/api', (req, res) => {
  res.json({ message: 'SpotFinder API is running!' });
});

app.use('/spots', spotsRouter);
app.use('/users', usersRouter);
app.use('/upload', uploadRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`SpotFinder API running on port ${PORT}`);
});