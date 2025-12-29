"use strict";
import { DataSource } from "typeorm";
import { DATABASE, DB_USERNAME, HOST, PASSWORD } from "./configEnv.js";
import UserSchema from "../entity/user.entity.js";
import SupervisorEntity from "../entity/supervisor.entity.js";
import ProfileSchema from "../entity/profile.entity.js";
import PracticeApplicationSchema from "../entity/practiceApplication.entity.js";
import MessageSchema from "../entity/message.entity.js";
import InternshipExternalSchema from "../entity/internshipExternal.entity.js";
import InternshipEntity from "../entity/internship.entity.js";
import DocumentSchema from "../entity/document.entity.js";
import ConversationSchema from "../entity/conversation.entity.js";
import CompanyEntity from "../entity/company.entity.js";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: `${HOST}`,
  port: 5432,
  username: `${DB_USERNAME}`,
  password: `${PASSWORD}`,
  database: `${DATABASE}`,
  entities: [
    UserSchema,
    SupervisorEntity,
    ProfileSchema,
    PracticeApplicationSchema,
    MessageSchema,
    InternshipExternalSchema,
    InternshipEntity,
    DocumentSchema,
    ConversationSchema,
    CompanyEntity,
  ],
  synchronize: true,
  logging: false,
});

export async function connectDB() {
  try {
    await AppDataSource.initialize();
    console.log("=> Conexión exitosa a la base de datos!");
  } catch (error) {
    console.error("Error al conectar con la base de datos:", error);
    process.exit(1);
  }
}