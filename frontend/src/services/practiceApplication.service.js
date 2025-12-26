import api from "./root.service.js";

export const createApplication = async (internshipId, attachments = null) => {
    try {
        const response = await api.post(`/practiceApplication/internship/${internshipId}`, {
            attachments
        });
        return [response.data, null];
    } catch (error) {
        return [null, error.response?.data?.message || "Error al enviar la solicitud"];
    }
};

export const getMyApplications = async () => {
    try {
        const response = await api.get("/practiceApplication/my");
        return [response.data.data, null];
    } catch (error) {
        return [null, error.response?.data?.message || "Error al obtener tus solicitudes"];
    }
};
