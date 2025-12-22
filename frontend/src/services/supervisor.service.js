import axios from './root.service.js';

export async function getSupervisorsByCompany(companyId) {
    try {
        const { data } = await axios.get(`/supervisors/${companyId}/supervisors`);
        return data.data;
    } catch (error) {
        return error.response?.data || { error: 'Unknown error' };
    }
}

export async function createSupervisor(companyId, supervisorData) {
    try {
        const { data } = await axios.post(`/supervisors/${companyId}/supervisors`, supervisorData);
        return data;
    } catch (error) {
        return error.response?.data || { error: 'Unknown error' };
    }
}
