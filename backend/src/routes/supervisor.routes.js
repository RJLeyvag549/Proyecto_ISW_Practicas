"use strict";
import { Router } from "express";
import {
  createSupervisor,
  getAllSupervisors,
  getSupervisorById,
  updateSupervisor,
  deleteSupervisor
} from "../controllers/supervisor.controller.js";

import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { isAdminOrCoordinator } from "../middlewares/authorization.middleware.js";
import { validateBody } from "../middlewares/joiValidation.middleware.js";
import { createSupervisorSchema, updateSupervisorSchema } from "../validations/supervisor.validation.js";

const router = Router();

// Todas las rutas protegidas
router.use(authenticateJwt, isAdminOrCoordinator);

// CRUD y listados por empresa
router.post("/:companyId/supervisors", validateBody(createSupervisorSchema), createSupervisor);
router.get("/:companyId/supervisors", getAllSupervisors);
router.get("/:companyId/supervisors/:id", getSupervisorById);
router.put("/:companyId/supervisors/:id", validateBody(updateSupervisorSchema), updateSupervisor);
router.delete("/:companyId/supervisors/:id", deleteSupervisor);

export default router;
