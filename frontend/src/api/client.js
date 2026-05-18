import axios from 'axios';

export const apiClient = axios.create({
  baseURL: '/api',
  timeout: 10000,
  withCredentials: true,
});

apiClient.interceptors.response.use(
  (response) => response,                       // success: pass through
  (error) => {
    const backendMessage = error.response?.data?.message;
    if (backendMessage) {
      error.message = backendMessage;          // surface server msg
    }

    if (error.response?.status === 401 && !error.config?.url?.includes('/auth/')) {
      window.location.href = '/login';        // session expired → redirect
    }

    return Promise.reject(error);
  }
);
