"use strict";
import { Router } from "express";
import {
  getProfile,
  updateStudentProfile,
  updateDocuments,
  updatePassword,
} from "../controllers/profile.controller.js";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";

const router = Router();

router.get("/", authenticateJwt, getProfile);
router.put("/", authenticateJwt, updateStudentProfile);
router.patch("/documents", authenticateJwt, updateDocuments);
router.patch("/password", authenticateJwt, updatePassword);

export default router;
