"use strict";

import { AppDataSource } from "../config/configDb.js";

const documentRepository = AppDataSource.getRepository("Document");
const practiceApplicationRepository = AppDataSource.getRepository("PracticeApplication");
const internshipExternalRepository = AppDataSource.getRepository("InternshipExternal");


export const DocumentService = {
  async createDocument(documentData, file) {
    const practiceApplication = await practiceApplicationRepository.findOne({
      where: { id: documentData.practiceApplicationId },
      relations: ["student"],
    });

    if (!practiceApplication) {
      throw new Error("Práctica no encontrada");
    }

    const document = documentRepository.create({
      ...documentData,
      uploadedBy: Number(documentData.uploadedBy),
      filename: file.originalname,
      filepath: file.path,
      status: "pending",
    });

    return documentRepository.save(document);
  },

  async getDocumentsByPracticeId(practiceId) {
    return documentRepository.find({
      where: { practiceApplicationId: practiceId },
      order: { createdAt: "DESC" },
    });
  },

  async getAllDocuments() {
    return documentRepository.find({
      relations: ["uploader"],
      order: { createdAt: "DESC" },
    });
  },

  async getDocumentPath(documentId) {
    const document = await documentRepository.findOne({ where: { id: documentId } });
    if (!document) throw new Error("Documento no encontrado");
    return { filepath: document.filepath, filename: document.filename };
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
    const document = await documentRepository.findOne({
      where: { id: documentId },
    });

    if (!document) {
      throw new Error("Documento no encontrado");
    }

    const payload = { ...updateData };
    if (payload.grade !== undefined && payload.grade !== null) {
      payload.grade = Number(payload.grade);
    }

    Object.assign(document, payload);
    return documentRepository.save(document);
  },

  async deleteDocument(documentId) {
    const result = await documentRepository.delete(documentId);
    if (result.affected === 0) {
      throw new Error("Documento no encontrado");
    }
    return { success: true };
  },

  async getGradeStatistics(practiceApplicationId) {
    const documents = await documentRepository.find({
      where: { 
        practiceApplicationId,
        status: "approved"
      },
    });

    const gradedDocuments = documents.filter(doc => doc.grade !== null && doc.grade !== undefined);

    if (gradedDocuments.length === 0) {
      return {
        documents: [],
        weightedAverage: null,
        simpleAverage: null,
        totalWeight: 0,
        hasIncompleteWeights: false
      };
    }

    const totalWeight = gradedDocuments.reduce((sum, doc) => sum + Number(doc.weight || 0), 0);
    const hasIncompleteWeights = totalWeight !== 100;

    let weightedAverage = null;
    if (totalWeight > 0) {
      const weightedSum = gradedDocuments.reduce((sum, doc) => {
        return sum + (Number(doc.grade) * (Number(doc.weight || 0) / 100));
      }, 0);
      weightedAverage = weightedSum;
    }

    const simpleAverage = gradedDocuments.reduce((sum, doc) => sum + Number(doc.grade), 0) / gradedDocuments.length;

    return {
      documents: gradedDocuments.map(doc => ({
        id: doc.id,
        filename: doc.filename,
        type: doc.type,
        grade: Number(doc.grade),
        weight: Number(doc.weight || 0)
      })),
      weightedAverage: weightedAverage ? Number(weightedAverage.toFixed(2)) : null,
      simpleAverage: Number(simpleAverage.toFixed(2)),
      totalWeight,
      hasIncompleteWeights
    };
  },

  async getStudentAverages() {
    const documents = await documentRepository.find({
      where: { status: "approved" },
      relations: ["uploader"],
    });

    const gradedDocuments = documents.filter(doc => doc.grade !== null && doc.grade !== undefined);

    const studentMap = new Map();

    gradedDocuments.forEach(doc => {
      const studentId = doc.uploadedBy;
      if (!studentMap.has(studentId)) {
        studentMap.set(studentId, {
          studentId,
          studentName: doc.uploader?.nombreCompleto || `Usuario ${studentId}`,
          documents: [],
          totalWeight: 0,
          weightedAverage: 0,
        });
      }

      const student = studentMap.get(studentId);
      const weight = Number(doc.weight || 0);
      const grade = Number(doc.grade);

      student.documents.push({
        id: doc.id,
        filename: doc.filename,
        grade,
        weight,
        contribution: grade * (weight / 100)
      });

      student.totalWeight += weight;
      student.weightedAverage += grade * (weight / 100);
    });

    const result = {};
    studentMap.forEach((student, studentId) => {
      result[studentId] = {
        average: student.totalWeight > 0 ? Number(student.weightedAverage.toFixed(2)) : null,
        totalWeight: student.totalWeight,
        isComplete: student.totalWeight === 100
      };
    });

    return result;
  },

  async getMyDocuments(userId) {
    return documentRepository.find({
      where: { uploadedBy: userId },
      order: { createdAt: "DESC" },
    });
  },

  async getMyAverage(userId) {
    const documents = await documentRepository.find({
      where: { 
        uploadedBy: userId,
        status: "approved"
      },
    });

    const gradedDocuments = documents.filter(doc => doc.grade !== null && doc.grade !== undefined);

    if (gradedDocuments.length === 0) {
      return {
        documents: [],
        average: null,
        totalWeight: 0,
        isComplete: false
      };
    }

    const totalWeight = gradedDocuments.reduce((sum, doc) => sum + Number(doc.weight || 0), 0);
    const weightedSum = gradedDocuments.reduce((sum, doc) => {
      return sum + (Number(doc.grade) * (Number(doc.weight || 0) / 100));
    }, 0);

    return {
      documents: gradedDocuments.map(doc => ({
        id: doc.id,
        filename: doc.filename,
        type: doc.type,
        grade: Number(doc.grade),
        weight: Number(doc.weight || 0),
        comments: doc.comments,
        createdAt: doc.createdAt
      })),
      average: weightedSum > 0 ? Number(weightedSum.toFixed(2)) : null,
      totalWeight,
      isComplete: totalWeight === 100
    };
  },
};