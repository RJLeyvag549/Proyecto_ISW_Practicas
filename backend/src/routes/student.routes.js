"use strict";
import express from "express";
import {
  registerStudent,
  getPendingStudents,
  approveStudent,
} from "../controllers/student.controller.js";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { isAdminOrCoordinator } from "../middlewares/authorization.middleware.js";

const router = express.Router();

// Public route for student registration
router.post("/register", registerStudent);

// Protected routes for coordinators
router.get("/pending", authenticateJwt, isAdminOrCoordinator, getPendingStudents);
router.post("/:id/approve", authenticateJwt, isAdminOrCoordinator, approveStudent);

export default router;