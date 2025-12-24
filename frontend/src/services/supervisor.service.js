import axios from './root.service.js';

export async function getSupervisorsByCompany(companyId) {
    const { data } = await axios.get(`/companies/${companyId}/supervisors`);
    return data.data;
}

export async function createSupervisor(companyId, supervisorData) {
    const { data } = await axios.post(`/companies/${companyId}/supervisors`, supervisorData);
    return data;
}

export async function updateSupervisor(companyId, supervisorId, supervisorData) {
    const { data } = await axios.put(`/companies/${companyId}/supervisors/${supervisorId}`, supervisorData);
    return data;
}

export async function deleteSupervisor(companyId, supervisorId) {
    const { data } = await axios.delete(`/companies/${companyId}/supervisors/${supervisorId}`);
    return data;
}
