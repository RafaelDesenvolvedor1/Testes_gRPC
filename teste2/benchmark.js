// benchmark.js
const http = require('http');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const packageDef = protoLoader.loadSync('transacoes.proto');
const proto = grpc.loadPackageDefinition(packageDef).financeiro;
const client = new proto.TransacaoService('127.0.0.1:50051', grpc.credentials.createInsecure());

// 1. Medir REST
function testarRest() {
  return new Promise((resolve) => {
    const inicio = performance.now();
    http.get('http://localhost:3000/transacoes?limite=5000', (res) => {
      let bytes = 0;
      res.on('data', (chunk) => { bytes += chunk.length; });
      res.on('end', () => {
        const duracao = (performance.now() - inicio).toFixed(2);
        resolve({ nome: 'REST (JSON)', duracao: `${duracao} ms`, tamanho: `${(bytes / 1024).toFixed(2)} KB` });
      });
    });
  });
}

// 2. Medir gRPC Unário
function testarGrpcUnario() {
  return new Promise((resolve) => {
    const inicio = performance.now();
    client.ListarTransacoes({ limite: 5000 }, (err, res) => {
      const duracao = (performance.now() - inicio).toFixed(2);
      // Serialização estimada do payload retornado
      const bytes = Buffer.byteLength(JSON.stringify(res)); // Estimativa de tamanho em memória
      resolve({ nome: 'gRPC (Unário)', duracao: `${duracao} ms` });
    });
  });
}

// 3. Medir gRPC Streaming
function testarGrpcStream() {
  return new Promise((resolve) => {
    const inicio = performance.now();
    let totalItens = 0;
    const stream = client.StreamTransacoes({ limite: 5000 });
    
    stream.on('data', () => { totalItens++; });
    stream.on('end', () => {
      const duracao = (performance.now() - inicio).toFixed(2);
      resolve({ nome: 'gRPC (Streaming)', duracao: `${duracao} ms`, itens: totalItens });
    });
  });
}

async function rodar() {
  console.log('--- Iniciando Testes (5.000 registros) --- �\n');
  console.log(await testarRest());
  console.log(await testarGrpcUnario());
  console.log(await testarGrpcStream());
}

rodar();