"use strict";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import indexRoutes from "./routes/index.routes.js";
import session from "express-session";
import passport from "passport";
import express, { json, urlencoded } from "express";
import path from "path";
import { fileURLToPath } from "url";
import { cookieKey, HOST, PORT } from "./config/configEnv.js";
import { connectDB } from "./config/configDb.js";
import { createUsers } from "./config/initialSetup.js";
import { passportJwtSetup } from "./auth/passport.auth.js";
import { createServer } from "http";
import { Server } from "socket.io";
import { createMessageService } from "./services/message.service.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsPath = path.resolve(__dirname, "../../uploads");

async function setupServer() {
  try {
    const app = express();
    const httpServer = createServer(app);

    // Iniciar Socket.io
    const io = new Server(httpServer, {
      cors: {
        origin: true,
        credentials: true,
      },
    });

    app.disable("x-powered-by");

    app.use(
      cors({
        credentials: true,
        origin: true,
      }),
    );

    app.use(
      urlencoded({
        extended: true,
        limit: "1mb",
      }),
    );

    app.use(
      json({
        limit: "1mb",
      }),
    );

    app.use(cookieParser());

    app.use(morgan("dev"));

    app.use(
      session({
        secret: cookieKey,
        resave: false,
        saveUninitialized: false,
        cookie: {
          secure: false,
          httpOnly: true,
          sameSite: "strict",
        },
      }),
    );

    app.use(passport.initialize());
    app.use(passport.session());

    passportJwtSetup();

    app.use("/uploads", express.static(uploadsPath));

    app.use("/api", indexRoutes);

    io.on("connection", (socket) => {
      console.log("Usuario conectado:", socket.id);

      socket.on("join_conversation", (conversationId) => {
        socket.join(`conversation_${conversationId}`);
        console.log(`Socket ${socket.id} joined conversation ${conversationId}`);
      });

      socket.on("send_message", async (data) => {
        try {
          const { conversationId, senderId, content } = data;
          const [message, error] = await createMessageService(
            conversationId,
            senderId,
            content
          );

          if (!error && message) {
            io.to(`conversation_${conversationId}`).emit("new_message", message);
          }
        } catch (error) {
          console.error("Error sending message:", error);
        }
      });

      socket.on("typing", (data) => {
        socket.to(`conversation_${data.conversationId}`).emit("user_typing", {
          userId: data.userId,
          isTyping: data.isTyping,
        });
      });

      socket.on("disconnect", () => {
        console.log("Usuario desconectado:", socket.id);
      });
    });

    httpServer.listen(PORT, () => {
      console.log(`=> Servidor corriendo en ${HOST}:${PORT}/api`);
    });
  } catch (error) {
    console.log("Error en index.js -> setupServer(), el error es: ", error);
  }
}

async function setupAPI() {
  try {
    await connectDB();
    await setupServer();
    await createUsers();
  } catch (error) {
    console.log("Error en index.js -> setupAPI(), el error es: ", error);
  }
}

setupAPI()
  .then(() => console.log("=> API Iniciada exitosamente"))
  .catch((error) =>
    console.log("Error en index.js -> setupAPI(), el error es: ", error),
  );