import axios from 'axios';
import catchError from './catchError';

/*
 * axios instance for auth* only
 */
const instance = axios.create({
  baseURL: process.env.AUTH_API_BASE,
  timeout: 10000,
});

instance.defaults.headers.post['Content-Type'] = 'application/json';

//错误处理
instance.interceptors.response.use((response) => response, catchError);

export default instance;
