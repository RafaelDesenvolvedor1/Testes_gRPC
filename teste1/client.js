// client.js
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const packageDef = protoLoader.loadSync('usuario.proto');
const proto = grpc.loadPackageDefinition(packageDef).usuario;

// Criação do Stub (o dublê de rede)
const client = new proto.UsuarioService(
  '127.0.0.1:50051',
  grpc.credentials.createInsecure()
);

// Chamada via Stub: parece uma função local!
client.ObterUsuario({ id: 999 }, (err, response) => {
  if (err) {
    console.error(`Erro ${err.code}: ${err.details}`);
    return;
  }
  console.log("Usuário:", response);
});