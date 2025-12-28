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
//tener todos los documentos
router.get(
  "/",authenticateJwt,DocumentController.getAllDocuments
);
//tener documentos agrupados por estudiante y practica
router.get(
  "/grouped",authenticateJwt,DocumentController.getGroupedByStudentPractice
);
//tener mis documentos (estudiante)
router.get(
  "/my-documents",
  authenticateJwt,
  DocumentController.getMyDocuments
);
//obtener mi promedio de documentos (estudiante)
router.get(
  "/my-average",
  authenticateJwt,
  DocumentController.getMyAverage
);
//descargar documento por id
router.get("/:documentId/download",authenticateJwt,DocumentController.downloadDocument
);
//subir documento
router.post("/upload",authenticateJwt,uploadDocument,validateBody(createDocumentSchema),
DocumentController.uploadDocument);
//actualizar estado del documento
router.patch("/:documentId/status",authenticateJwt,validateBody(updateDocumentSchema),
  DocumentController.updateDocumentStatus);
//eliminar documento
router.delete("/:documentId",authenticateJwt,DocumentController.deleteDocument);

export default router;