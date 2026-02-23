import axios from 'axios';

const client = axios.create({
    baseURL: 'http://localhost:5145/api', // Make sure this matches your backend port!
    headers: {
        'Content-Type': 'application/json',
    },
});

client.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default client;