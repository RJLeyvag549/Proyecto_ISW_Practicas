"use strict";

import { DocumentService } from "../services/document.service.js";
import {
  handleErrorClient,
  handleErrorServer,
  handleSuccess,
} from "../handlers/responseHandlers.js";

export const DocumentController = {

  async uploadDocument(req, res) {
    try {
      const document = await DocumentService.createDocument(req.body, req.file);
      return handleSuccess(res, 201, "Documento subido exitosamente", document);
    } catch (error) {
      return handleErrorServer(res, 500, error.message);
    }
  },

  async getDocumentsByPractice(req, res) {
    try {
      const documents = await DocumentService.getDocumentsByPracticeId(
        req.params.practiceId
      );
      if (Array.isArray(documents) && documents.length === 0) {
        return handleSuccess(res, 204);
      }
      return handleSuccess(
        res,
        200,
        "Documentos obtenidos exitosamente",
        documents,
      );
    } catch (error) {
      return handleErrorServer(res, 500, error.message);
    }
  },

  async updateDocumentStatus(req, res) {
    try {
      const document = await DocumentService.updateDocumentStatus(
        req.params.documentId,
        req.body
      );
      return handleSuccess(res, 200, "Estado del documento actualizado", document);
    } catch (error) {
      return handleErrorServer(res, 500, error.message);
    }
  },

  async deleteDocument(req, res) {
    try {
      await DocumentService.deleteDocument(req.params.documentId);
      return handleSuccess(res, 200, "Documento eliminado exitosamente");
    } catch (error) {
      return handleErrorServer(res, 500, error.message);
    }
  },
};