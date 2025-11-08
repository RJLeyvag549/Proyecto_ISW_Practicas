import { useState, useEffect, useCallback } from 'react';
import { getPendingStudents, processStudentRequest } from '@services/student.service.js';

const useGetPendingStudents = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchStudents = useCallback(async () => {
        setLoading(true);
        const data = await getPendingStudents();
        if (Array.isArray(data)) {
            setStudents(data);
            setError(null);
        } else {
            setError(data);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchStudents();
    }, [fetchStudents]);

    const approveStudent = async (id) => {
        const payload = { approved: true };
        const res = await processStudentRequest(id, payload);
        await fetchStudents();
        return res;
    };

    const rejectStudent = async (id, reason) => {
        const payload = { approved: false, rejectionReason: reason };
        const res = await processStudentRequest(id, payload);
        await fetchStudents();
        return res;
    };

    return { students, loading, error, fetchStudents, approveStudent, rejectStudent };
};

export default useGetPendingStudents;
