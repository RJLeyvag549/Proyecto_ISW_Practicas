"use strict";

import { DocumentService } from "../services/document.service.js";
import {
  handleErrorClient,
  handleErrorServer,
  handleSuccess,
} from "../handlers/responseHandlers.js";

export const DocumentController = {

  async getAllDocuments(req, res) {
    try {
      const documents = await DocumentService.getAllDocuments();
      return handleSuccess(res, 200, "Documentos obtenidos", documents);
    } catch (error) {
      return handleErrorServer(res, 500, error.message);
    }
  },

  async downloadDocument(req, res) {
    try {
      const { filepath, filename } = await DocumentService.getDocumentPath(req.params.documentId);
      return res.download(filepath, filename);
    } catch (error) {
      return handleErrorServer(res, 500, error.message);
    }
  },

  async uploadDocument(req, res) {
    try {
      if (!req.file) {
        return handleErrorClient(res, 400, "Archivo requerido");
      }

      const documentData = {
        ...req.body,
        uploadedBy: req.user?.id,
      };

      const document = await DocumentService.createDocument(documentData, req.file);
      return handleSuccess(res, 201, "Documento subido exitosamente", document);
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

  async getGroupedByStudentPractice(req, res) {
    try {
      const grouped = await DocumentService.getDocumentsGroupedByStudentAndPractice();
      return handleSuccess(res, 200, "Documentos agrupados", grouped);
    } catch (error) {
      return handleErrorServer(res, 500, error.message);
    }
  },

  async getMyDocuments(req, res) {
    try {
      const documents = await DocumentService.getMyDocuments(req.user.id);
      return handleSuccess(res, 200, "Documentos obtenidos", documents);
    } catch (error) {
      return handleErrorServer(res, 500, error.message);
    }
  },

  async getMyAverage(req, res) {
    try {
      const average = await DocumentService.getMyAverage(req.user.id);
      return handleSuccess(res, 200, "Promedio obtenido", average);
    } catch (error) {
      return handleErrorServer(res, 500, error.message);
    }
  },
};