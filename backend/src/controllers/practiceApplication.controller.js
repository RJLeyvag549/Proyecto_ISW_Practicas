"use strict";
import {
  addPracticeApplicationAttachments,
  createPracticeApplication,
  getAllPracticeApplications,
  getPracticeApplicationById,
  getPracticeApplicationsByStudent,
  updatePracticeApplication,
} from "../services/practiceApplication.service.js";
import {
  attachmentsValidation,
  practiceApplicationValidation,
  statusUpdateValidation,
} from "../validations/practiceApplication.validation.js";
import {
  handleErrorClient,
  handleErrorServer,
  handleSuccess,
} from "../handlers/responseHandlers.js";

/**
 * Controlador para crear una nueva solicitud de practica (solo estudiante autenticado).
 */
export async function createApplication(req, res) {
  try {

    if (req.user.rol !== "estudiante") {
      return handleErrorClient(res, 403, "Solo los estudiantes pueden crear solicitudes de practica");
    }

    const internshipId = parseInt(req.params.internshipId, 10);
    if (!Number.isInteger(internshipId) || internshipId <= 0) {
      return handleErrorClient(res, 400, "internshipId inválido en la URL");
    }

    const { body } = req;
    const { error } = practiceApplicationValidation.validate(body);
    if (error) {
      return handleErrorClient(res, 400, "Error de validacion", error.message);
    }

    const studentId = req.user.id;
    const [application, serviceError] = await createPracticeApplication(studentId, {
      internshipId,
      attachments: body.attachments,
    });

    if (serviceError)
      return handleErrorClient(res, 400, "Error al crear la solicitud", serviceError);

    handleSuccess(res, 201, "Solicitud creada exitosamente", application);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

/**
 * Controlador para listar solicitudes propias (solo estudiante).
 */
export async function getMyApplications(req, res) {
  try {
    const studentId = req.user.id;
    const [applications, serviceError] = await getPracticeApplicationsByStudent(studentId);

    if (serviceError)
      return handleErrorClient(res, 400, "Error al obtener solicitudes", serviceError);

    handleSuccess(res, 200, "Solicitudes recuperadas exitosamente", applications);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

/**
 * Controlador para ver una solicitud especifica (estudiante dueño o encargado).
 */
export async function getApplicationById(req, res) {
  try {
    const { id } = req.params;
    const requester = req.user;
    const [application, serviceError] = await getPracticeApplicationById(parseInt(id), requester);

    if (serviceError)
      return handleErrorClient(res, 403, "Acceso denegado o solicitud no encontrada", serviceError);

    handleSuccess(res, 200, "Solicitud recuperada exitosamente", application);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

/**
 * Controlador para listar todas las solicitudes (solo encargado/admin).
 */
export async function getAllApplications(req, res) {
  try {
    const filters = {
      status: req.query.status,
      studentId: req.query.studentId,
      internshipId: req.query.internshipId,
    };
    const [applications, serviceError] = await getAllPracticeApplications(filters);

    if (serviceError)
      return handleErrorClient(res, 400, "Error al obtener solicitudes", serviceError);

    handleSuccess(res, 200, "Solicitudes recuperadas exitosamente", applications);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

/**
 * Controlador para actualizar estado y comentarios de una solicitud (solo encargado/admin).
 */
export async function updateApplication(req, res) {
  try {
    const { id } = req.params;
    const { error } = statusUpdateValidation.validate(req.body);
    if (error)
      return handleErrorClient(res, 400, "Error de validacion", error.message);

    const { status, coordinatorComments } = req.body;
    const coordinatorId = req.user.id;
    const [application, serviceError] = await updatePracticeApplication(
      parseInt(id),
      status,
      coordinatorComments,
      coordinatorId
    );

    if (serviceError)
      return handleErrorClient(res, 400, "Error al actualizar la solicitud", serviceError);

    handleSuccess(res, 200, "Solicitud actualizada exitosamente", application);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

/**
 * Controlador para agregar documentos adjuntos (solo estudiante dueño).
 */
export async function addAttachments(req, res) {
  try {
    const { id } = req.params;
    const { error } = attachmentsValidation.validate(req.body);
    if (error)
      return handleErrorClient(res, 400, "Error de validacion", error.message);

    const studentId = req.user.id;
    const { attachments } = req.body;
    const [application, serviceError] = await addPracticeApplicationAttachments(
      parseInt(id),
      attachments,
      studentId
    );

    if (serviceError)
      return handleErrorClient(res, 400, "Error al agregar documentos", serviceError);

    handleSuccess(res, 200, "Documentos agregados exitosamente", application);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}
