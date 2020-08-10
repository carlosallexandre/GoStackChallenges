import axios from 'axios';

console.log('http://192.168.0.103:3333');

const api = axios.create({
  baseURL: 'http://192.168.0.103:3333',
});

export default api;
