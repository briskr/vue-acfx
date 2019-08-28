import axios from 'axios';

const hub = axios.create({
  baseURL: '',
  timeout: 10000,
});

export default hub;
