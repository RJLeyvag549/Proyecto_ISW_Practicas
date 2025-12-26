import axios from './root.service.js';

// Obtener todas las solicitudes (admin)
export async function getAllApplications(filters = {}) {
    try {
        const params = new URLSearchParams();
        if (filters.status) params.append('status', filters.status);
        if (filters.studentId) params.append('studentId', filters.studentId);
        
        const { data } = await axios.get(`/practice-applications?${params.toString()}`);
        return data.data;
    } catch (error) {
        return { error: error.response?.data?.message || 'Error al obtener solicitudes' };
    }
}

// Obtener mis solicitudes (estudiante)
export async function getMyApplications() {
    try {
        const { data } = await axios.get('/practice-applications/my');
        return data.data;
    } catch (error) {
        return { error: error.response?.data?.message || 'Error al obtener solicitudes' };
    }
}

// Obtener solicitud por ID
export async function getApplicationById(id) {
    try {
        const { data } = await axios.get(`/practice-applications/${id}`);
        return data.data;
    } catch (error) {
        return { error: error.response?.data?.message || 'Error al obtener solicitud' };
    }
}

// Crear solicitud para oferta existente
export async function applyToInternship(internshipId, attachments = []) {
    try {
        const { data } = await axios.post(`/practice-applications/internship/${internshipId}`, { attachments });
        return data;
    } catch (error) {
        return { error: error.response?.data?.message || 'Error al crear solicitud' };
    }
}

// Crear solicitud externa
export async function applyExternal(companyData, attachments = []) {
    try {
        const { data } = await axios.post('/practice-applications/internshipExternal', { companyData, attachments });
        return data;
    } catch (error) {
        return { error: error.response?.data?.message || 'Error al crear solicitud' };
    }
}

// Actualizar estado de solicitud (admin)
export async function updateApplicationStatus(id, status, coordinatorComments = '') {
    try {
        const { data } = await axios.patch(`/practice-applications/${id}`, { status, coordinatorComments });
        return data;
    } catch (error) {
        return { error: error.response?.data?.message || 'Error al actualizar solicitud' };
    }
}

// Agregar documentos a solicitud
export async function addAttachments(id, attachments) {
    try {
        const { data } = await axios.patch(`/practice-applications/${id}/attachments`, { attachments });
        return data;
    } catch (error) {
        return { error: error.response?.data?.message || 'Error al agregar documentos' };
    }
}

// Cerrar práctica (admin/coordinador)
export async function closeApplication(id, minAverage = 4.0) {
    try {
        const { data } = await axios.post(`/practice-applications/${id}/close`, { minAverage });
        return data;
    } catch (error) {
        return { error: error.response?.data?.message || 'Error al cerrar práctica' };
    }
}
