import { EntitySchema } from "typeorm";

const ConversationSchema = new EntitySchema({
    name: "Conversation",
    tableName: "conversations",
    columns: {
        id: {
            type: "int",
            primary: true,
            generated: true,
        },
        studentId: {
            type: "int",
            nullable: false,
        },
        lastMessageAt: {
            type: "timestamp with time zone",
            default: () => "CURRENT_TIMESTAMP",
            nullable: false,
        },
        unreadByAdmin: {
            type: "int",
            default: 0,
            nullable: false,
        },
        unreadByStudent: {
            type: "int",
            default: 0,
            nullable: false,
        },
        status: {
            type: "varchar",
            length: 20,
            default: "active",
            nullable: false,
        },
        createdAt: {
            type: "timestamp with time zone",
            default: () => "CURRENT_TIMESTAMP",
            nullable: false,
        },
    },
    relations: {
        student: {
            type: "many-to-one",
            target: "User",
            joinColumn: { name: "studentId" },
            onDelete: "CASCADE",
        },
        messages: {
            type: "one-to-many",
            target: "Message",
            inverseSide: "conversation",
        },
    },
    indices: [
        {
            name: "IDX_CONVERSATION_STUDENT",
            columns: ["studentId"],
        },
    ],
});

export default ConversationSchema;
