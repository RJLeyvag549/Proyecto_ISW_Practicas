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

const router = express.Router();

router.get("/", authenticateJwt, isAdminOrCoordinator, getAllCompanies);
router.get("/:id", authenticateJwt, isAdminOrCoordinator, getCompanyById);
router.post("/", authenticateJwt, isAdminOrCoordinator, createCompany);
router.put("/:id", authenticateJwt, isAdminOrCoordinator, updateCompany);
router.delete("/:id", authenticateJwt, isAdminOrCoordinator, deleteCompany);

export default router;
