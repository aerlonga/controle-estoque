const express = require('express');
const cors = require('cors');
const app = express();
const routes = require('./routes');

// CORS - Permitir requisições do frontend
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
}));

app.use(require('cookie-parser')());
app.use(express.json());
app.use('/api', routes);

module.exports = app;
