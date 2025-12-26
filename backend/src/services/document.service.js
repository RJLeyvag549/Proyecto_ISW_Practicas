"use strict";

import { AppDataSource } from "../config/configDb.js";

const documentRepository = AppDataSource.getRepository("Document");
const practiceApplicationRepository = AppDataSource.getRepository("PracticeApplication");
const internshipExternalRepository = AppDataSource.getRepository("InternshipExternal");


export const DocumentService = {

  async createDocument(documentData, file) {
    try {
      const { practiceApplicationId, internshipExternalId } = documentData;

      if (!practiceApplicationId && !internshipExternalId) {
        throw new Error("Debe especificar practiceApplicationId o internshipExternalId");
      }

      if (practiceApplicationId) {
        const practiceApplication = await practiceApplicationRepository.findOne({
          where: { id: practiceApplicationId },
          relations: ["student"],
        });

        if (!practiceApplication) {
          throw new Error("Práctica no encontrada");
        }
      }

      if (internshipExternalId) {
        const external = await internshipExternalRepository.findOne({ where: { id: internshipExternalId } });
        if (!external) {
          throw new Error("Práctica externa no encontrada");
        }
      }

      const document = documentRepository.create({
        ...documentData,
        filename: file.originalname,
        filepath: file.path,
        status: "pending",
      });

      return await documentRepository.save(document);
    } catch (error) {
      throw error;
    }
  },


  async getDocumentsByPracticeId(practiceId) {
    try {
      return await documentRepository.find({
        where: { practiceApplicationId: practiceId },
        order: { createdAt: "DESC" },
      });
    } catch (error) {
      throw error;
    }
  },

  async getDocumentsByExternalId(externalId) {
    try {
      return await documentRepository.find({
        where: { internshipExternalId: externalId },
        order: { createdAt: "DESC" },
      });
    } catch (error) {
      throw error;
    }
  },

  async updateDocumentStatus(documentId, updateData) {
    try {
      const document = await documentRepository.findOne({
        where: { id: documentId },
      });

      if (!document) {
        throw new Error("Documento no encontrado");
      }

      Object.assign(document, updateData);
      return await documentRepository.save(document);
    } catch (error) {
      throw error;
    }
  },

  async deleteDocument(documentId) {
    try {
      const result = await documentRepository.delete(documentId);
      if (result.affected === 0) {
        throw new Error("Documento no encontrado");
      }
      return { success: true };
    } catch (error) {
      throw error;
    }
  },
};