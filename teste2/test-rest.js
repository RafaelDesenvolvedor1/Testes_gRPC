import http from 'k6/http';
import { check } from 'k6';

export const options = {
  vus: 20,
  duration: '15s',
};

export default function () {
  const res = http.get('http://localhost:3000/transacoes?limite=10000&offset=0');
  check(res, {
    'status 200': (r) => r.status === 200,
  });
}