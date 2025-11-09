"use strict";
import express from "express";
import {
  createCompany,
  getAllCompanies,
  getCompanyById,
  updateCompany,
  deleteCompany,
} from "../controllers/company.controller.js";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { isAdminOrCoordinator } from "../middlewares/authorization.middleware.js";
import { validateBody } from "../middlewares/joiValidation.middleware.js";
import { createCompanySchema, updateCompanySchema } from "../validations/company.validation.js";

const router = express.Router();

router.get("/", authenticateJwt, isAdminOrCoordinator, getAllCompanies);
router.get("/:id", authenticateJwt, isAdminOrCoordinator, getCompanyById);
router.post("/", authenticateJwt, isAdminOrCoordinator, validateBody(createCompanySchema), createCompany);
router.put("/:id", authenticateJwt, isAdminOrCoordinator, validateBody(updateCompanySchema), updateCompany);
router.delete("/:id", authenticateJwt, isAdminOrCoordinator, deleteCompany);

export default router;
