"use strict";

import { Router } from "express";
import { DocumentController } from "../controllers/document.controller.js";
import { validateBody } from "../middlewares/joiValidation.middleware.js";
import { 
  createDocumentSchema, 
  updateDocumentSchema 
} from "../validations/document.validation.js";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { uploadDocument } from "../middlewares/upload.middleware.js";

const router = Router();

router.get(
  "/",
  authenticateJwt,
  DocumentController.getAllDocuments
);

router.get(
  "/grouped",
  authenticateJwt,
  DocumentController.getGroupedByStudentPractice
);

router.get(
  "/my-documents",
  authenticateJwt,
  DocumentController.getMyDocuments
);

router.get(
  "/my-average",
  authenticateJwt,
  DocumentController.getMyAverage
);

router.get(
  "/:documentId/download",
  authenticateJwt,
  DocumentController.downloadDocument
);

router.post(
  "/upload",
  authenticateJwt,
  uploadDocument,
  validateBody(createDocumentSchema),
  DocumentController.uploadDocument
);

router.patch(
  "/:documentId/status",
  authenticateJwt,
  validateBody(updateDocumentSchema),
  DocumentController.updateDocumentStatus
);

router.delete(
  "/:documentId",
  authenticateJwt,
  DocumentController.deleteDocument
);

export default router;