import axios from 'axios';

const api = axios.create({
 baseURL: 'http://172.22.70.10:3333/'
});

export { api };