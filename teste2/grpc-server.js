// grpc-server.js
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const { db, seed } = require('./database');

seed(10000);

const packageDef = protoLoader.loadSync('transacoes.proto');
const proto = grpc.loadPackageDefinition(packageDef).financeiro;

// 1. Implementação Unária (similar ao REST: monta tudo e devolve)
function listarTransacoes(call, callback) {
  const limite = call.request.limite || 50;
  const offset = call.request.offset || 0;

  const transacoes = db.prepare('SELECT * FROM transacoes LIMIT ? OFFSET ?').all(limite, offset);
  callback(null, { transacoes });
}

// 2. Implementação Streaming (envia linha a linha pelo stream)
function streamTransacoes(call) {
  const limite = call.request.limite || 5000;
  const offset = call.request.offset || 0;
  const stmt = db.prepare('SELECT * FROM transacoes LIMIT ?');

  // Itera pelo cursor do SQLite sem carregar tudo em memória de uma vez
  for (const linha of stmt.iterate(limite)) {
    call.write(linha); // Despacha imediatamente pela conexão HTTP/2
  }
  call.end(); // Encerra o fluxo
}

const server = new grpc.Server();
server.addService(proto.TransacaoService.service, {
  ListarTransacoes: listarTransacoes,
  StreamTransacoes: streamTransacoes
});

server.bindAsync('127.0.0.1:50051', grpc.ServerCredentials.createInsecure(), () => {
  console.log('Servidor gRPC rodando na porta 50051 ⚡');
});