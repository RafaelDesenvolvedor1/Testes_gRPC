import http from 'k6/http';
import { check } from 'k6';

export const options = {
  vus: 20,
  duration: '15s',
};

export default function () {
  const res = http.get('http://192.168.0.247:3000/transacoes?limite=10000&offset=0');
  check(res, {
    'status 200': (r) => r.status === 200,
  });
}