"use strict";
import {
  addPracticeApplicationAttachments,
  closePracticeApplication,
  createPracticeApplication,
  getAllPracticeApplications,
  getPracticeApplicationById,
  getPracticeApplicationsByStudent,
  updatePracticeApplication,
} from "../services/practiceApplication.service.js";
import {
  attachmentsValidation,
  closeApplicationValidation,
  practiceApplicationValidation,
  statusUpdateValidation,
} from "../validations/practiceApplication.validation.js";
import {
  handleErrorClient,
  handleErrorServer,
  handleSuccess,
} from "../handlers/responseHandlers.js";

export async function createApplication(req, res) {
  try {
    const allowedRoles = ["usuario", "estudiante"];
    if (!allowedRoles.includes(req.user.rol)) {
      return handleErrorClient(res, 403, "Solo los estudiantes pueden crear solicitudes de práctica");
    }

    const { body } = req;
    const { internshipId } = req.params; // Capturar ID de la URL si existe

    let applicationData;

    // Si hay internshipId en los parámetros, es una solicitud a oferta existente
    if (internshipId) {
      applicationData = {
        applicationType: "existing",
        internshipId: parseInt(internshipId),
        attachments: body.attachments
      };
    } else {
      // Si no hay internshipId, debe ser una solicitud externa
      applicationData = {
        applicationType: "external",
        companyData: body.companyData,
        attachments: body.attachments
      };
    }

    // Usar la validación original que ya maneja ambos casos
    const { error } = practiceApplicationValidation.validate(applicationData);
    if (error)
      return handleErrorClient(res, 400, "Error de validación", error.message);

    const studentId = req.user.id;
    const [application, serviceError] = await createPracticeApplication(studentId, applicationData);

    if (serviceError)
      return handleErrorClient(res, 400, "Error al crear la solicitud", serviceError);

    const message = internshipId
      ? "Solicitud a práctica existente creada exitosamente"
      : "Solicitud de práctica externa creada exitosamente";

    handleSuccess(res, 201, message, application);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

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

export async function getAllApplications(req, res) {
  try {
    const filters = {
      status: req.query.status,
      studentId: req.query.studentId,
      offerId: req.query.offerId,
    };
    const [applications, serviceError] = await getAllPracticeApplications(filters);

    if (serviceError)
      return handleErrorClient(res, 400, "Error al obtener solicitudes", serviceError);

    handleSuccess(res, 200, "Solicitudes recuperadas exitosamente", applications);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

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

/**
 * Controlador para cerrar una práctica (admin o coordinador).
 * Calcula promedio de notas y marca resultado final.
 */
export async function closeApplication(req, res) {
  try {
    const { id } = req.params;
    const { error } = closeApplicationValidation.validate(req.body || {});
    if (error) {
      return handleErrorClient(res, 400, "Error de validación", error.message);
    }
    const { minAverage } = req.body || {};
    const [application, serviceError] = await closePracticeApplication(parseInt(id), { minAverage });
    if (serviceError) {
      return handleErrorClient(res, 400, "No se pudo cerrar la práctica", serviceError);
    }
    handleSuccess(res, 200, "Práctica cerrada exitosamente", application);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}
