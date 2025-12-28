import axios from './root.service.js';

// Obtener todas las solicitudes (admin)
export async function getAllApplications(filters = {}) {
    try {
        const params = new URLSearchParams();
        if (filters.status) params.append('status', filters.status);
        if (filters.studentId) params.append('studentId', filters.studentId);
        
        const { data } = await axios.get(`/practiceApplications?${params.toString()}`);
        return data.data;
    } catch (error) {
        return { error: error.response?.data?.message || 'Error al obtener solicitudes' };
    }
}

// Obtener mis solicitudes (estudiante)
export async function getMyApplications() {
    try {
        const { data } = await axios.get('/practiceApplications/my');
        return data.data;
    } catch (error) {
        return { error: error.response?.data?.message || 'Error al obtener solicitudes' };
    }
}

// Obtener solicitud por ID
export async function getApplicationById(id) {
    try {
        const { data } = await axios.get(`/practiceApplications/${id}`);
        return data.data;
    } catch (error) {
        return { error: error.response?.data?.message || 'Error al obtener solicitud' };
    }
}

// Crear solicitud para oferta existente
export async function applyToInternship(internshipId, attachments = []) {
    try {
        const { data } = await axios.post(`/practiceApplications/internship/${internshipId}`, { attachments });
        return data;
    } catch (error) {
        return { error: error.response?.data?.message || 'Error al crear solicitud' };
    }
}

// Crear solicitud externa
export async function applyExternal(companyData, attachments = []) {
    try {
        const payload = { 
            applicationType: "external",
            companyData, 
            attachments 
        };
        
        console.log('Enviando solicitud externa:', payload);
        console.log('companyData:', companyData);
        
        const { data } = await axios.post('/practiceApplications/internshipExternal', payload);
        return data;
    } catch (error) {
        console.error('Error completo:', error);
        console.error('Error response:', error.response);
        console.error('Error data:', error.response?.data);
        
        const errorData = error.response?.data;
        // Manejar diferentes formatos de error del backend
        let errorMessage = 'Error al crear solicitud';
        if (errorData?.message) {
            errorMessage = errorData.message;
        } else if (errorData?.details) {
            errorMessage = errorData.details;
        } else if (typeof errorData === 'string') {
            errorMessage = errorData;
        }
        return { error: errorMessage };
    }
}

// Editar solicitud externa (estudiante)
export async function updateOwnApplication(id, companyData, attachments = []) {
    try {
        const { data } = await axios.put(`/practiceApplications/${id}`, { companyData, attachments });
        return data;
    } catch (error) {
        const err = error.response?.data;
        const message = err?.details || err?.message || 'Error al editar solicitud';
        return { error: message };
    }
}

// Eliminar solicitud externa (estudiante)
export async function deleteOwnApplication(id) {
    try {
        const { data } = await axios.delete(`/practiceApplications/${id}`);
        return data;
    } catch (error) {
        return { error: error.response?.data?.message || 'Error al eliminar solicitud' };
    }
}

// Actualizar estado de solicitud (admin)
export async function updateApplicationStatus(id, status, coordinatorComments = '') {
    try {
        const payload = { status };
        // Solo incluir comentarios si no están vacíos
        if (coordinatorComments && coordinatorComments.trim()) {
            payload.coordinatorComments = coordinatorComments.trim();
        }
        const { data } = await axios.patch(`/practiceApplications/${id}`, payload);
        return data;
    } catch (error) {
        return { error: error.response?.data?.message || error.response?.data?.details || 'Error al actualizar solicitud' };
    }
}

// Agregar documentos a solicitud
export async function addAttachments(id, attachments) {
    try {
        const { data } = await axios.patch(`/practiceApplications/${id}/attachments`, { attachments });
        return data;
    } catch (error) {
        return { error: error.response?.data?.message || 'Error al agregar documentos' };
    }
}

// Cerrar práctica (admin/coordinador)
export async function closeApplication(id, minAverage = 4.0) {
    try {
        const { data } = await axios.post(`/practiceApplications/${id}/close`, { minAverage });
        return data;
    } catch (error) {
        return { error: error.response?.data?.message || 'Error al cerrar práctica' };
    }
}
