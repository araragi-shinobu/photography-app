import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Galleries API
export const galleriesAPI = {
    getAll: () => api.get('/galleries'),
    getOne: (id) => api.get(`/galleries/${id}`),
    create: (data) => api.post('/galleries', data),
    update: (id, data) => api.put(`/galleries/${id}`, data),
    delete: (id) => api.delete(`/galleries/${id}`),

    // Photos
    getPhotos: (galleryId) => api.get(`/galleries/${galleryId}/photos`),
    uploadPhoto: (galleryId, file) => {
        const formData = new FormData();
        formData.append('file', file);
        return api.post(`/galleries/${galleryId}/photos`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },
    deletePhoto: (galleryId, photoId) => api.delete(`/galleries/${galleryId}/photos/${photoId}`),
    setCoverPhoto: (galleryId, photoId) => api.put(`/galleries/${galleryId}/cover/${photoId}`),
};

// Film Stocks API
export const filmStocksAPI = {
    getAll: () => api.get('/film-stocks'),
    getOne: (id) => api.get(`/film-stocks/${id}`),
    create: (data) => api.post('/film-stocks', data),
    update: (id, data) => api.put(`/film-stocks/${id}`, data),
    delete: (id) => api.delete(`/film-stocks/${id}`),
};

// Trips API
export const tripsAPI = {
    getAll: () => api.get('/trips'),
    getOne: (id) => api.get(`/trips/${id}`),
    create: (data) => api.post('/trips', data),
    update: (id, data) => api.put(`/trips/${id}`, data),
    delete: (id) => api.delete(`/trips/${id}`),

    // Images
    uploadImage: (tripId, file, caption) => {
        const formData = new FormData();
        formData.append('file', file);
        if (caption) formData.append('caption', caption);
        return api.post(`/trips/${tripId}/images`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },
    deleteImage: (tripId, imageId) => api.delete(`/trips/${tripId}/images/${imageId}`),

    // Weather and photography times
    getWeather: (tripId, date) => {
        const params = date ? { date } : {};
        return api.get(`/trips/${tripId}/weather`, { params });
    },
};

export default api;

