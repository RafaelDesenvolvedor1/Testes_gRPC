// database.js
const Database = require('better-sqlite3');
const db = new Database('transacoes.db');

// Otimizações de leitura no SQLite
db.pragma('journal_mode = WAL');

function seed(total = 5000) {
  console.log(`Limpando e recriando tabela para ${total} registros... ⏳`);

  // 1. Remove e recria a tabela do zero
  db.exec(`
    DROP TABLE IF EXISTS transacoes;
    CREATE TABLE transacoes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      conta_origem TEXT NOT NULL,
      conta_destino TEXT NOT NULL,
      valor REAL NOT NULL,
      status TEXT NOT NULL,
      timestamp INTEGER NOT NULL
    );
  `);

  // 2. Prepara e insere os registros solicitados
  const insert = db.prepare(`
    INSERT INTO transacoes (conta_origem, conta_destino, valor, status, timestamp)
    VALUES (?, ?, ?, ?, ?)
  `);

  const statuses = ['CONCLUIDO', 'PENDENTE', 'FALHA'];
  const insertMany = db.transaction((linhas) => {
    for (let i = 1; i <= linhas; i++) {
      insert.run(
        `CONTA-${1000 + (i % 500)}`,
        `CONTA-${2000 + (i % 500)}`,
        Number((Math.random() * 5000).toFixed(2)),
        statuses[i % 3],
        Date.now() - (i * 1000)
      );
    }
  });

  insertMany(total);
  console.log(`${total} registros inseridos com sucesso! ✅`);
}

module.exports = { db, seed };