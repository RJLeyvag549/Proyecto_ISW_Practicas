import axios from './root.service.js';

export async function getAllCompanies() {
    const { data } = await axios.get('/companies');
    return data.data;
}

export async function createCompany(companyData) {
    const { data } = await axios.post('/companies', companyData);
    return data;
}

export async function updateCompany(id, companyData) {
    const { data } = await axios.put(`/companies/${id}`, companyData);
    return data;
}

export async function deleteCompany(id) {
    const { data } = await axios.delete(`/companies/${id}`);
    return data;
}
