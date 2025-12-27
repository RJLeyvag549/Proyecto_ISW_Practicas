import { EntitySchema } from "typeorm";

const MessageSchema = new EntitySchema({
    name: "Message",
    tableName: "messages",
    columns: {
        id: {
            type: "int",
            primary: true,
            generated: true,
        },
        conversationId: {
            type: "int",
            nullable: false,
        },
        senderId: {
            type: "int",
            nullable: false,
        },
        content: {
            type: "text",
            nullable: false,
        },
        isRead: {
            type: "boolean",
            default: false,
            nullable: false,
        },
        createdAt: {
            type: "timestamp with time zone",
            default: () => "CURRENT_TIMESTAMP",
            nullable: false,
        },
    },
    relations: {
        conversation: {
            type: "many-to-one",
            target: "Conversation",
            joinColumn: { name: "conversationId" },
            onDelete: "CASCADE",
        },
        sender: {
            type: "many-to-one",
            target: "User",
            joinColumn: { name: "senderId" },
            onDelete: "CASCADE",
        },
    },
    indices: [
        {
            name: "IDX_MESSAGE_CONVERSATION",
            columns: ["conversationId"],
        },
        {
            name: "IDX_MESSAGE_SENDER",
            columns: ["senderId"],
        },
    ],
});

export default MessageSchema;
