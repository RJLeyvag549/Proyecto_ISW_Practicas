import api from "./root.service.js";

export const createApplication = async (internshipId, attachments = null) => {
    try {
        const payload = {};
        if (attachments) payload.attachments = attachments;

        const response = await api.post(`/practiceApp/internship/${internshipId}`, payload);
        return [response.data, null];
    } catch (error) {
        const message = error.response?.data?.message || "Error al enviar la solicitud";
        const details = error.response?.data?.details;
        return [null, details ? `${message}: ${details}` : message];
    }
};

export const getMyApplications = async () => {
    try {
        const response = await api.get("/practiceApp/my");
        return [response.data.data, null];
    } catch (error) {
        const message = error.response?.data?.message || "Error al obtener tus solicitudes";
        const details = error.response?.data?.details;
        return [null, details ? `${message}: ${details}` : message];
    }
};
