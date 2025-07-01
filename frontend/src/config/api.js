// Configuration centralisée de l'API
export const API_BASE_URL = 'https://localhost:5000';

// Helper pour les appels API avec credentials
export const fetchWithCredentials = (url, options = {}) => {
  return fetch(url, {
    credentials: 'include',
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  });
}; 
