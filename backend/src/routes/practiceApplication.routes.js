"use strict";
import { Router } from "express";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { isAdmin, isAdminOrCoordinator } from "../middlewares/authorization.middleware.js";
import { uploadDocumentsArray } from "../middlewares/uploadDocuments.middleware.js";
import {
  closeApplication,
  createApplication,
  getAllApplications,
  getApplicationById,
  getMyApplications,
  updateApplication,
  updateOwnApplication,
  deleteOwnApplication,
  uploadAttachmentsFiles,
} from "../controllers/practiceApplication.controller.js";

const router = Router();

router.post("/internship/:internshipId", authenticateJwt, createApplication);
router.post("/internshipExternal", authenticateJwt, createApplication);

router.get("/my", authenticateJwt, getMyApplications);
router.get("/:id", authenticateJwt, getApplicationById);
router.put("/:id", authenticateJwt, updateOwnApplication);
router.delete("/:id", authenticateJwt, deleteOwnApplication);
router.get("/", authenticateJwt, isAdmin, getAllApplications);
router.patch("/:id", authenticateJwt, isAdmin, updateApplication);

router.post("/:id/attachments/upload",authenticateJwt,uploadDocumentsArray("documents", 5),uploadAttachmentsFiles);

router.post("/:id/close", authenticateJwt, isAdminOrCoordinator, closeApplication);

export default router;
