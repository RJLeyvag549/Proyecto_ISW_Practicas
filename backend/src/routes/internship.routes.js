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

const router = Router();

router.get("/", getAllInternships);
router.get("/companies/:companyId", getInternshipsByCompany);
router.get("/companies/:companyId/supervisors/:supervisorId", getInternshipsBySupervisor);
router.get("/:id", getInternshipById);

router.use(authenticateJwt, isAdminOrCoordinator);

router.post("/companies/:companyId/supervisors/:supervisorId", createInternship);
router.put("/:id", updateInternship);
router.delete("/:id", deleteInternship);

export default router;
