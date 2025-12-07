const express = require('express');
const app = express();
const routes = require('./routes');

// Middleware para parsing JSON
app.use(express.json());

// Registra todas as rotas com prefixo /api
app.use('/api', routes);

module.exports = app;
