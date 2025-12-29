import axios from './root.service.js';

export async function getMyProfile() {
  const { data } = await axios.get('/profile/');
  return data.data;
}

export async function getUserProfile(userId) {
  try {
    const { data } = await axios.get(`/profile/${userId}`);
    return data.data;
  } catch (error) {
    return { error: error.response?.data?.message || 'Error al obtener el perfil' };
  }
}

export async function changeMyPassword(password, newPassword) {
  const { data } = await axios.patch('/profile/password', { password, newPassword });
  return data;
}

export async function updateMyProfile(profileData) {
  try {
    const { data } = await axios.put('/profile/', profileData);
    return data;
  } catch (error) {
    return { error: error.response?.data?.message || 'Error al actualizar el perfil' };
  }
}

export async function uploadMyProfileDocument(fileObjects) {
  try {
    const formData = new FormData();
    fileObjects.forEach((file) => {
      formData.append('documents', file);
    });
    const { data } = await axios.post('/profile/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return data.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error al subir documentos');
  }
}

export async function deleteProfileDocuments(docTypes) {
  try {
    const { data } = await axios.delete('/profile/documents', {
      data: { docTypes }
    });
    return data.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error al eliminar documentos');
  }
}
