import axios from './root.service.js';

export async function getAllInternships() {
    try {
        const { data } = await axios.get('/internships');
        return data.data;
    } catch (error) {
        return error.response?.data || { error: 'Unknown error' };
    }
}

export async function createInternship(companyId, supervisorId, internshipData) {
    try {
        const { data } = await axios.post(`/internships/companies/${companyId}/supervisors/${supervisorId}`, internshipData);
        return data;
    } catch (error) {
        return error.response?.data || { error: 'Unknown error' };
    }
}

export async function deleteInternship(id) {
    try {
        const { data } = await axios.delete(`/internships/${id}`);
        return data;
    } catch (error) {
        return error.response?.data || { error: 'Unknown error' };
    }
}
