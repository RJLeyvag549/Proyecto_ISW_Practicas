"use strict";

import { AppDataSource } from "../config/configDb.js";

const documentRepository = AppDataSource.getRepository("Document");
const practiceApplicationRepository = AppDataSource.getRepository("PracticeApplication");
const internshipExternalRepository = AppDataSource.getRepository("InternshipExternal");

//servicio de documentos
export const DocumentService = {
  //funcion para calcular el promedio de documentos
  _calculateAverage(docs = []) {
    const graded = docs.filter(
      (d) => d.status === "approved" && d.grade !== null && d.grade !== undefined
    );
    if (graded.length === 0) {
      return { average: null, totalWeight: 0, isComplete: false };
    }

    const totalWeight = graded.reduce((sum, d) => sum + Number(d.weight || 0), 0);
    const useWeighted = totalWeight > 0;

    let avg = 0;
    if (useWeighted) {
      const weightedSum = graded.reduce(
        (sum, d) => sum + Number(d.grade) * (Number(d.weight || 0) / 100),
        0
      );
      avg = weightedSum;
    } else {
      const simple = graded.reduce((sum, d) => sum + Number(d.grade), 0) / graded.length;
      avg = simple;
    }

    return {
      average: Number(avg.toFixed(2)),
      totalWeight,
      isComplete: useWeighted ? totalWeight === 100 : graded.length > 0,
    };
  },
//funcion para obtener la etiqueta de practica
  _getPracticeLabel(doc) {
    return (
      doc?.practiceApplication?.internship?.title ||
      doc?.practiceApplication?.internshipExternal?.companyName ||
      (doc?.practiceApplicationId ? `Práctica #${doc.practiceApplicationId}` : "Práctica")
    );
  },
//obtener todos los documentos
  async getAllDocuments() {
    return documentRepository.find({
      relations: [
        "uploader",
        "practiceApplication",
        "practiceApplication.internship",
        "practiceApplication.internshipExternal",
      ],
      order: { createdAt: "DESC" },
    });
  },
//obtener documentos agrupados por estudiante y practica
  async getDocumentsGroupedByStudentAndPractice() {
    const docs = await documentRepository.find({
      relations: [
        "uploader",
        "practiceApplication",
        "practiceApplication.internship",
        "practiceApplication.internshipExternal",
      ],
      order: { createdAt: "DESC" },
    });

    const studentsMap = new Map();

    docs.forEach((doc) => {
      const studentId = doc.uploadedBy;
      if (!studentsMap.has(studentId)) {
        studentsMap.set(studentId, {
          studentId,
          studentName: doc.uploader?.nombreCompleto || `Usuario ${studentId}`,
          practices: new Map(),
        });
      }

      const student = studentsMap.get(studentId);
      const practiceLabel = this._getPracticeLabel(doc);
      const practiceKey = doc.practiceApplicationId ?? practiceLabel;

      if (!student.practices.has(practiceKey)) {
        student.practices.set(practiceKey, {
          practiceApplicationId: doc.practiceApplicationId,
          practiceLabel,
          documents: [],
        });
      }

      const practice = student.practices.get(practiceKey);
      practice.documents.push({
        id: doc.id,
        filename: doc.filename,
        type: doc.type,
        status: doc.status,
        grade: doc.grade,
        weight: doc.weight,
        comments: doc.comments,
        createdAt: doc.createdAt,
        uploadedBy: doc.uploadedBy,
        practiceApplicationId: doc.practiceApplicationId,
      });
    });

    const students = Array.from(studentsMap.values()).map((student) => {
      const practices = Array.from(student.practices.values()).map((practice) => ({
        ...practice,
        average: this._calculateAverage(practice.documents),
      }));

      const allDocs = practices.flatMap((p) => p.documents);
      const overallAverage = this._calculateAverage(allDocs);

      return {
        studentId: student.studentId,
        studentName: student.studentName,
        practices,
        overallAverage,
        totalDocuments: allDocs.length,
      };
    });

    return students;
  },
//obtener ruta del documento
  async getDocumentPath(documentId) {
    const document = await documentRepository.findOne({ where: { id: documentId } });
    if (!document) throw new Error("Documento no encontrado");
    return { filepath: document.filepath, filename: document.filename };
  },
//obtener mis documentos
  async getMyDocuments(userId) {
    return documentRepository.find({
      where: { uploadedBy: userId },
      relations: [
        "practiceApplication",
        "practiceApplication.internship",
        "practiceApplication.internshipExternal",
      ],
      order: { createdAt: "DESC" },
    });
  },
//obtener mi promedio
  async getMyAverage(userId) {
    const documents = await documentRepository.find({
      where: {
        uploadedBy: userId,
        status: "approved",
      },
    });

    const gradedDocuments = documents.filter((doc) => doc.grade !== null && doc.grade !== undefined);

    if (gradedDocuments.length === 0) {
      return {
        documents: [],
        average: null,
        totalWeight: 0,
        isComplete: false,
      };
    }

    const totalWeight = gradedDocuments.reduce((sum, doc) => sum + Number(doc.weight || 0), 0);
    const weightedSum = gradedDocuments.reduce((sum, doc) => {
      return sum + Number(doc.grade) * (Number(doc.weight || 0) / 100);
    }, 0);

    return {
      documents: gradedDocuments.map((doc) => ({
        id: doc.id,
        filename: doc.filename,
        type: doc.type,
        grade: Number(doc.grade),
        weight: Number(doc.weight || 0),
        comments: doc.comments,
        createdAt: doc.createdAt,
      })),
      average: weightedSum > 0 ? Number(weightedSum.toFixed(2)) : null,
      totalWeight,
      isComplete: totalWeight === 100,
    };
  },
//subir documento
  async createDocument(documentData, file) {
    // Permitir documentos ligados a práctica interna o externa
    let practiceApplication = null;
    const isAttachment = documentData.type === "ATTACHMENT";

    if (documentData.practiceApplicationId) {
      practiceApplication = await practiceApplicationRepository.findOne({
        where: { id: documentData.practiceApplicationId },
        relations: ["student"],
      });
      if (!practiceApplication) {
        throw new Error("Práctica no encontrada");
      }
    }

    if (documentData.internshipExternalId) {
      const external = await internshipExternalRepository.findOne({
        where: { id: documentData.internshipExternalId },
      });
      if (!external) {
        throw new Error("Práctica externa no encontrada");
      }
    }

    // Validaciones diferentes según tipo:
    // - ATTACHMENT: adjuntos de solicitud externa (se suben mientras está pending/needsInfo)
    // - Otros: documentos finales (se suben cuando está accepted)
    if (practiceApplication) {
      const uploaderId = Number(documentData.uploadedBy);
      if (practiceApplication.studentId !== uploaderId) {
        throw new Error("No puedes subir documentos a una práctica de otro estudiante");
      }

      if (isAttachment) {
        // Para adjuntos: solo validar que esté en estado editable (pending o needsInfo)
        if (!["pending", "needsInfo"].includes(practiceApplication.status)) {
          throw new Error("Solo puedes agregar adjuntos mientras la solicitud está pendiente o requiere info");
        }
      } else {
        // Para documentos finales: validar que esté aceptado y no cerrado
        if (practiceApplication.status !== "accepted") {
          throw new Error("Solo puedes subir documentos cuando la práctica está aceptada");
        }

        if (practiceApplication.isClosed) {
          throw new Error("No se pueden subir documentos a una práctica cerrada");
        }
      }
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
//actualizar estado y notas del documento
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
//eliminar documento
  async deleteDocument(documentId) {
    const result = await documentRepository.delete(documentId);
    if (result.affected === 0) {
      throw new Error("Documento no encontrado");
    }
    return { success: true };
  },
};