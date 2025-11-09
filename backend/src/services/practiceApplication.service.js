"use strict";
import { AppDataSource } from "../config/configDb.js";
import PracticeApplicationSchema from "../entity/practiceApplication.entity.js";
import { sendEmail } from "../helpers/email.helper.js";

const practiceApplicationRepository = AppDataSource.getRepository("PracticeApplication");

/**
 * Crea una nueva solicitud de práctica.
 */
export async function createPracticeApplication(studentId, data) {
  // TODO: Validar existencia de estudiante y oferta cuando existan las entidades.
  try {
    const newApplication = await practiceApplicationRepository.save({
      studentId,
      offerId: data.offerId,
      status: "pending",
      coordinatorComments: null,
      attachments: data.attachments || null,
    });
  return [newApplication, null];
  } catch (error) {
    return [null, error.message];
  }
}

/**
 * Devuelve todas las solicitudes de un estudiante.
 */
export async function getPracticeApplicationsByStudent(studentId) {
  try {
    const applications = await practiceApplicationRepository.find({
      where: { studentId },
      order: { createdAt: "DESC" },
    });
    return [applications, null];
  } catch (error) {
    return [null, error.message];
  }
}

/**
 * Devuelve una solicitud específica, verificando permisos.
 */
export async function getPracticeApplicationById(id, requester) {
  try {
    const application = await practiceApplicationRepository.findOneBy({ id });
  if (!application) return [null, "Solicitud no encontrada"];

    // Permitir acceso solo al dueño o administrador
    if (
      application.studentId !== requester.id
      && requester.rol !== "administrador"
    ) {
  return [null, "No tienes permiso para ver esta solicitud"];
    }
    return [application, null];
  } catch (error) {
    return [null, error.message];
  }
}

/**
 * Devuelve todas las solicitudes (solo administrador).
 */
export async function getAllPracticeApplications(filters) {
  try {
    const where = {};
    if (filters.status) where.status = filters.status;
    if (filters.studentId) where.studentId = filters.studentId;
    if (filters.offerId) where.offerId = filters.offerId;

    const applications = await practiceApplicationRepository.find({
      where,
      order: { createdAt: "DESC" },
    });
  return [applications, null];
  } catch (error) {
    return [null, error.message];
  }
}

/**
 * Actualiza el estado y comentarios de una solicitud.
 * - coordinatorComments: obligatorio en rejected/needsInfo
 */
export async function updatePracticeApplication(id, newStatus, coordinatorComments, coordinatorId) {
  try {
    const application = await practiceApplicationRepository.findOneBy({ id });
  if (!application) return [null, "Solicitud no encontrada"];

    // Validar transicion de estado
    if (application.status === "accepted" && newStatus === "needsInfo") {
  return [null, "No se puede volver de accepted a needsInfo"];
    }

    // Validar comentarios obligatorios
    if (
      (newStatus === "rejected" || newStatus === "needsInfo")
      && (!coordinatorComments || coordinatorComments.trim() === "")
    ) {
  return [null, "Debes ingresar comentarios del encargado"];
    }

  // Actualizar solicitud
  application.status = newStatus;
  application.coordinatorComments = coordinatorComments || null;
  application.updatedAt = new Date();

  await practiceApplicationRepository.save(application);

    // Notificar al estudiante (email)
    let subject, body;
    if (newStatus === "accepted") {
  subject = "Solicitud de practica aceptada";
  body = "Tu solicitud ha sido aceptada.";
    } else if (newStatus === "rejected") {
  subject = "Solicitud de practica rechazada";
  body = `Tu solicitud ha sido rechazada. Comentarios: ${coordinatorComments}`;
    } else if (newStatus === "needsInfo") {
  subject = "Informacion adicional requerida";
  body = `Se requiere informacion adicional. Comentarios: ${coordinatorComments}`;
    }
    // await sendEmail(studentEmail, subject, body);

    return [application, null];
  } catch (error) {
    return [null, error.message];
  }
}

/**
 * Permite al estudiante agregar documentos si la solicitud está en pending o needsInfo.
 */
export async function addPracticeApplicationAttachments(id, attachments, studentId) {
  try {
    const application = await practiceApplicationRepository.findOneBy({ id });
    if (!application) return [null, "Solicitud no encontrada"];
    if (application.studentId !== studentId) return [null, "No tienes permiso"];
    if (application.status !== "pending" && application.status !== "needsInfo") {
      return [null, "Solo puedes agregar documentos en estado pending o needsInfo"];
    }

    application.attachments = attachments;
    await practiceApplicationRepository.save(application);
    return [application, null];
  } catch (error) {
    return [null, error.message];
  }
}
