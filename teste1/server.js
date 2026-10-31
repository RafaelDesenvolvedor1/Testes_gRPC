// server.js
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

// Carrega o contrato .proto dinamicamente
const packageDef = protoLoader.loadSync('usuario.proto');
const proto = grpc.loadPackageDefinition(packageDef).usuario;

// Implementação real da lógica
function obterUsuario(call, callback) {
  const userId = call.request.id;

  // 1. Validação de formato/tipo
  if (!userId || userId <= 0) {
    return callback({
      code: grpc.status.INVALID_ARGUMENT,
      message: "O ID do usuário deve ser um número inteiro positivo."
    });
  }

  // Simulação de busca no banco
  const usuario = bancoDeDados.find(u => u.id === userId);

  // 2. Validação de existência do recurso
  if (!usuario) {
    return callback({
      code: grpc.status.NOT_FOUND,
      message: `Usuário com ID ${userId} não foi encontrado.`
    });
  }

  // Sucesso: primeiro parâmetro é null (sem erro)
  callback(null, usuario);
}

const server = new grpc.Server();
server.addService(proto.UsuarioService.service, {
  ObterUsuario: obterUsuario
});

server.bindAsync('127.0.0.1:50051', grpc.ServerCredentials.createInsecure(), () => {
  console.log('Servidor gRPC rodando na porta 50051 �');
});