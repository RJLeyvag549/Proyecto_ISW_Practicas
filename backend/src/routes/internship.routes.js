"use strict";
import { Router } from "express";
import {
  createInternship,
  getAllInternships,
  getInternshipById,
  updateInternship,
  deleteInternship,
  getInternshipsByCompany,
  getInternshipsBySupervisor
} from "../controllers/internship.controller.js";

import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { isAdminOrCoordinator } from "../middlewares/authorization.middleware.js";
import { validateBody } from "../middlewares/joiValidation.middleware.js";
import { validateInternshipParams } from "../middlewares/validateInternshipParams.middleware.js";
import { createInternshipSchema, updateInternshipSchema } from "../validations/internship.validation.js";

const router = Router();

router.use(authenticateJwt);

router.get("/", getAllInternships);
router.get("/companies/:companyId", getInternshipsByCompany);
router.get("/companies/:companyId/supervisors/:supervisorId", getInternshipsBySupervisor);
router.get("/:id", getInternshipById);

router.post(
  "/companies/:companyId/supervisors/:supervisorId",
  isAdminOrCoordinator,
  validateInternshipParams,
  validateBody(createInternshipSchema),
  createInternship
);

router.put("/:id",isAdminOrCoordinator,validateBody(updateInternshipSchema),updateInternship);

router.delete("/:id",isAdminOrCoordinator,deleteInternship);

export default router;
