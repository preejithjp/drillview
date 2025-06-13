import axios, { type AxiosInstance } from 'axios';

axios.defaults.headers.post['Content-Type'] = 'application/json';

export const httpTransport: AxiosInstance = axios.create({
  baseURL: '/api',
});
