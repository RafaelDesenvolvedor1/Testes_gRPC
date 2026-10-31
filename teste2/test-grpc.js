import grpc from 'k6/net/grpc';
import { check } from 'k6';

const client = new grpc.Client();
// Aponta para a pasta onde está o transacoes.proto (seja na raiz '..' ou na pasta atual '.')
client.load(['..'], 'transacoes.proto');

let isConnected = false;


export const options = {
  vus: 20,
  duration: '15s',
};

export default function () {
  // Conecta apenas se ainda não estiver conectado no ciclo deste VU
  if (!isConnected) {
    client.connect('127.0.0.1:50051', { plaintext: true });
    isConnected = true;
  }
  const response = client.invoke('financeiro.TransacaoService/ListarTransacoes', {
    limite: 10000,
    offset: 0,
  });

  check(response, {
    'status OK': (r) => r && r.status === grpc.StatusOK,
  });

  // Removemos o client.close() daqui para reaproveitar o canal! �
}

export function teardown() {
  // Fecha a conexão somente no fim do teste geral
  client.close();
}