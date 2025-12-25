import axios from 'axios';
import cookies from 'js-cookie';

const API_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:3000/api';

// Create axios instance specifically for file uploads
const createFormDataInstance = () => {
  const token = cookies.get('jwt-auth', { path: '/' });
  return axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'multipart/form-data',
      'Authorization': token ? `Bearer ${token}` : '',
    },
    withCredentials: true,
  });
};

export const uploadDocument = async (documentData) => {
  try {
    const instance = createFormDataInstance();
    const response = await instance.post('/documents/upload', documentData);
    return response.data;
  } catch (error) {
    console.error('Error uploading document:', error);
    throw error.response?.data || error;
  }
};

export const getDocumentsByPractice = async (practiceId) => {
  try {
    const token = cookies.get('jwt-auth', { path: '/' });
    const response = await axios.get(`${API_URL}/documents/practice/${practiceId}`, {
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
      },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching documents:', error);
    throw error.response?.data || error;
  }
};

export const updateDocumentStatus = async (documentId, statusData) => {
  try {
    const token = cookies.get('jwt-auth', { path: '/' });
    const response = await axios.patch(`${API_URL}/documents/${documentId}/status`, statusData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
      },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error('Error updating document status:', error);
    throw error.response?.data || error;
  }
};

export const downloadDocument = async (documentId) => {
  try {
    const token = cookies.get('jwt-auth', { path: '/' });
    const response = await axios.get(`${API_URL}/documents/${documentId}/download`, {
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
      },
      responseType: 'blob',
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error('Error downloading document:', error);
    throw error.response?.data || error;
  }
};
