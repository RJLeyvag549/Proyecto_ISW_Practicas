"use strict";
import { Router } from "express";
import {
  createApplication,
  getMyApplications,
  getApplicationById,
  getAllApplications,
  updateApplication,
  addAttachments,
  cancelApplication,
} from "../controllers/practiceApplication.controller.js";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { isAdmin } from "../middlewares/authorization.middleware.js";

const router = Router();

// Rutas específicas para cada tipo de solicitud usando el mismo controlador
router.post("/internship/:internshipId", authenticateJwt, createApplication); // Para ofertas existentes
router.post("/internshipExternal", authenticateJwt, createApplication);       // Para externas

// Rutas generales
router.get("/my", authenticateJwt, getMyApplications);
router.get("/:id", authenticateJwt, getApplicationById);
router.get("/", authenticateJwt, isAdmin, getAllApplications);
router.patch("/:id", authenticateJwt, isAdmin, updateApplication);
router.patch("/:id/attachments", authenticateJwt, addAttachments);
router.delete("/:id", authenticateJwt, cancelApplication);

export default router;
