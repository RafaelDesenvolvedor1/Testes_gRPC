// rest-server.js
const express = require('express');
const { db, seed } = require('./database');

seed(10000);

const app = express();
const PORT = 3000;

app.get('/transacoes', (req, res) => {
  const limite = Number(req.query.limite) || 50;
  const offset = Number(req.query.offset) || 0;

  const transacoes = db.prepare('SELECT * FROM transacoes LIMIT ? OFFSET ?').all(limite, offset);
  res.json(transacoes);
});

app.listen(PORT, () => {
  console.log(`Servidor REST rodando em http://localhost:${PORT}`);
});