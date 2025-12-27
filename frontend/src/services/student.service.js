import axios from './root.service.js';
import { formatUserData } from '@helpers/formatData.js';

export async function getPendingStudents() {
    try {
        const { data } = await axios.get('/students/pending');
        // Format if needed
        return data.data.map(formatUserData);
    } catch (error) {
        return error.response?.data || { status: 'Error', message: 'Error fetching pending students' };
    }
}

export async function processStudentRequest(id, payload) {
    try {
        const { data } = await axios.post(`/students/${id}/approve`, payload);
        return data;
    } catch (error) {
        return error.response?.data || { status: 'Error', message: 'Error processing request' };
    }
}

export async function getPendingStudent(id) {
    try {
        const { data } = await axios.get(`/students/pending/${id}`);
        return formatUserData(data.data);
    } catch (error) {
        return error.response?.data || { status: 'Error', message: 'Error fetching student' };
    }
}
