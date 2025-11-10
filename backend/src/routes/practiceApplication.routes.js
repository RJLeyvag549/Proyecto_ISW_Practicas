"use strict";
import { Router } from "express";
import {
  addAttachments,
  closeApplication,
  createApplication,
  getAllApplications,
  getApplicationById,
  getMyApplications,
  updateApplication,
} from "../controllers/practiceApplication.controller.js";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { isAdmin, isAdminOrCoordinator } from "../middlewares/authorization.middleware.js";

const router = Router();

/**
 * Rutas para solicitudes de práctica
 */

// Crear nueva solicitud (solo estudiante autenticado)
router.post("/", authenticateJwt, createApplication);

// Listar solicitudes propias (solo estudiante autenticado)
router.get("/my", authenticateJwt, getMyApplications);

// Ver una solicitud específica (estudiante dueño o administrador)
router.get("/:id", authenticateJwt, getApplicationById);

// Listar todas las solicitudes (solo administrador)
router.get("/", authenticateJwt, isAdmin, getAllApplications);

// Actualizar estado y comentarios (solo administrador)
router.patch("/:id", authenticateJwt, isAdmin, updateApplication);

// Agregar documentos adjuntos (solo estudiante dueño)
router.patch("/:id/attachments", authenticateJwt, addAttachments);

// Cerrar práctica (admin o coordinador)
router.post("/:id/close", authenticateJwt, isAdminOrCoordinator, closeApplication);

export default router;
