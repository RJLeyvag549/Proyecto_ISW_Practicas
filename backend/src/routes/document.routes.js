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
import multer from "multer";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/documents/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

const router = Router();

router.post(
  "/upload",
  authenticateJwt,
  upload.single("document"),
  validateBody(createDocumentSchema),
  DocumentController.uploadDocument
);

router.get(
  "/practice/:practiceId",
  authenticateJwt,
  DocumentController.getDocumentsByPractice
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