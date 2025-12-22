import axios from './root.service.js';

export async function getAllCompanies() {
    try {
        const { data } = await axios.get('/companies');
        return data.data;
    } catch (error) {
        return error.response?.data || { error: 'Unknown error' };
    }
}

export async function createCompany(companyData) {
    try {
        const { data } = await axios.post('/companies', companyData);
        return data;
    } catch (error) {
        return error.response?.data || { error: 'Unknown error' };
    }
}
