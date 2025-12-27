"use strict";
import {
    getOrCreateConversationService,
    getAllConversationsService,
    getMessagesService,
    markMessagesAsReadService,
} from "../services/message.service.js";
import {
    handleErrorClient,
    handleErrorServer,
    handleSuccess,
} from "../handlers/responseHandlers.js";

export async function getOrCreateConversation(req, res) {
    try {
        const { studentId } = req.params;
        const [conversation, error] = await getOrCreateConversationService(parseInt(studentId));

        if (error) {
            return handleErrorClient(res, 400, "Error obteniendo conversación", error);
        }

        handleSuccess(res, 200, "Conversación obtenida con éxito", conversation);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}

export async function getAllConversations(req, res) {
    try {
        const [conversations, error] = await getAllConversationsService();

        if (error) {
            return handleErrorClient(res, 400, "Error obteniendo conversaciones", error);
        }

        handleSuccess(res, 200, "Conversaciones obtenidas con éxito", conversations);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}

export async function getMessages(req, res) {
    try {
        const { conversationId } = req.params;
        const [messages, error] = await getMessagesService(parseInt(conversationId));

        if (error) {
            return handleErrorClient(res, 400, "Error obteniendo mensajes", error);
        }

        handleSuccess(res, 200, "Mensajes obtenidos con éxito", messages);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}

export async function markMessagesAsRead(req, res) {
    try {
        const { conversationId } = req.params;
        const userId = req.user.id;

        const [result, error] = await markMessagesAsReadService(parseInt(conversationId), userId);

        if (error) {
            return handleErrorClient(res, 400, "Error marcando mensajes como leídos", error);
        }

        handleSuccess(res, 200, "Mensajes marcados como leídos", result);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}
