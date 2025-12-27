"use strict";
import { AppDataSource } from "../config/configDb.js";
import Conversation from "../entity/conversation.entity.js";
import Message from "../entity/message.entity.js";
import User from "../entity/user.entity.js";

const conversationRepository = AppDataSource.getRepository(Conversation);
const messageRepository = AppDataSource.getRepository(Message);
const userRepository = AppDataSource.getRepository(User);

export async function getOrCreateConversationService(studentId) {
    try {
        let conversation = await conversationRepository.findOne({
            where: { studentId },
            relations: ["student"],
        });

        if (!conversation) {
            conversation = conversationRepository.create({
                studentId,
                status: "active",
            });
            await conversationRepository.save(conversation);

            conversation = await conversationRepository.findOne({
                where: { id: conversation.id },
                relations: ["student"],
            });
        }

        return [conversation, null];
    } catch (error) {
        console.error("Error getting/creating conversation:", error);
        return [null, error.message];
    }
}

export async function getAllConversationsService() {
    try {
        const conversations = await conversationRepository.find({
            relations: ["student"],
            order: { lastMessageAt: "DESC" },
        });

        return [conversations, null];
    } catch (error) {
        console.error("Error getting conversations:", error);
        return [null, error.message];
    }
}

export async function getMessagesService(conversationId) {
    try {
        const messages = await messageRepository.find({
            where: { conversationId },
            relations: ["sender"],
            order: { createdAt: "ASC" },
        });

        return [messages, null];
    } catch (error) {
        console.error("Error getting messages:", error);
        return [null, error.message];
    }
}

export async function createMessageService(conversationId, senderId, content) {
    try {
        const message = messageRepository.create({
            conversationId,
            senderId,
            content,
        });

        await messageRepository.save(message);

        const conversation = await conversationRepository.findOne({
            where: { id: conversationId },
        });

        if (conversation) {
            const sender = await userRepository.findOne({ where: { id: senderId } });

            if (sender.rol === "administrador") {
                conversation.unreadByStudent += 1;
            } else {
                conversation.unreadByAdmin += 1;
            }

            conversation.lastMessageAt = new Date();
            await conversationRepository.save(conversation);
        }

        const fullMessage = await messageRepository.findOne({
            where: { id: message.id },
            relations: ["sender"],
        });

        return [fullMessage, null];
    } catch (error) {
        console.error("Error creating message:", error);
        return [null, error.message];
    }
}

export async function markMessagesAsReadService(conversationId, userId) {
    try {
        const user = await userRepository.findOne({ where: { id: userId } });

        if (!user) {
            return [null, "User not found"];
        }

        // Mark all messages in this conversation as read
        await messageRepository
            .createQueryBuilder()
            .update(Message)
            .set({ isRead: true })
            .where("conversationId = :conversationId", { conversationId })
            .andWhere("senderId != :userId", { userId })
            .execute();

        // Reset unread count for this user
        const conversation = await conversationRepository.findOne({
            where: { id: conversationId },
        });

        if (conversation) {
            if (user.rol === "administrador") {
                conversation.unreadByAdmin = 0;
            } else {
                conversation.unreadByStudent = 0;
            }
            await conversationRepository.save(conversation);
        }

        return [{ success: true }, null];
    } catch (error) {
        console.error("Error marking messages as read:", error);
        return [null, error.message];
    }
}
