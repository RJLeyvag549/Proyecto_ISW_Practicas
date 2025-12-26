"use strict";

import { Router } from "express";
import { DocumentController } from "../controllers/document.controller.js";
import { validateBody } from "../middlewares/joiValidation.middleware.js";
import { 
  createDocumentSchema, 
  gradeDocumentSchema,
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
  "/averages",
  authenticateJwt,
  DocumentController.getStudentAverages
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

router.get(
  "/practice/:practiceId",
  authenticateJwt,
  DocumentController.getDocumentsByPractice
);

router.get(
  "/practice/:practiceId/statistics",
  authenticateJwt,
  DocumentController.getGradeStatistics
);

router.patch(
  "/:documentId/status",
  authenticateJwt,
  validateBody(updateDocumentSchema),
  DocumentController.updateDocumentStatus
);

router.patch(
  "/:documentId/grade",
  authenticateJwt,
  validateBody(gradeDocumentSchema),
  DocumentController.updateDocumentStatus
);

router.delete(
  "/:documentId",
  authenticateJwt,
  DocumentController.deleteDocument
);

export default router;