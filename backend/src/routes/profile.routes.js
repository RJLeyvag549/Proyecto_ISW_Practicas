"use strict";
import { Router } from "express";
import {
  getProfile,
  updateStudentProfile,
  updateDocuments,
  updatePassword,
  uploadProfileDocuments,
} from "../controllers/profile.controller.js";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { uploadDocumentsArray } from "../middlewares/uploadDocuments.middleware.js";

const router = Router();

router.get("/", authenticateJwt, getProfile);
router.get("/:userId", authenticateJwt, getProfile);
router.put("/", authenticateJwt, updateStudentProfile);
router.patch("/documents", authenticateJwt, updateDocuments);
router.post("/documents/upload", authenticateJwt, uploadDocumentsArray("documents", 5), uploadProfileDocuments);
router.patch("/password", authenticateJwt, updatePassword);

export default router;
