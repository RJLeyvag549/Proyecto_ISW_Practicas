"use strict";
import { AppDataSource } from "../config/configDb.js";
import PracticeApplicationSchema from "../entity/practiceApplication.entity.js";
import { sendEmail } from "../helpers/email.helper.js";
import { createInternshipExternal } from "./internshipExternal.service.js";

const practiceApplicationRepository = AppDataSource.getRepository("PracticeApplication");
const userRepository = AppDataSource.getRepository("User");
const internshipRepository = AppDataSource.getRepository("Internship");

export async function createPracticeApplication(studentId, data) {
  try {
    const student = await userRepository.findOneBy({ id: studentId });
    if (!student) return [null, "Student not found"];

    if (!data.applicationType || !["existing", "external"].includes(data.applicationType)) {
      return [null, "Invalid application type. Must be 'existing' or 'external'"];
    }

    let applicationData = {
      studentId,
      applicationType: data.applicationType,
      status: "pending",
      coordinatorComments: null,
      attachments: data.attachments || null,
    };

    if (data.applicationType === "existing") {
      if (!data.internshipId) {
        return [null, "internshipId es requerido para aplicaciones a ofertas existentes"];
      }

      const internship = await internshipRepository.findOneBy({ id: data.internshipId });
      if (!internship) return [null, "Oferta de práctica no encontrada"];

      const existingApplication = await practiceApplicationRepository.findOne({
        where: { studentId, internshipId: data.internshipId },
      });
      if (existingApplication) {
        return [null, "Ya has enviado una solicitud para esta práctica"];
      }

      applicationData.internshipId = data.internshipId;
      applicationData.internshipExternalId = null;

    } else if (data.applicationType === "external") {
      if (!data.companyData) {
        return [null, "companyData es requerido para aplicaciones externas"];
      }

      const [internshipExternal, externalError] = await createInternshipExternal(studentId, data.companyData);
      if (externalError) {
        return [null, `Error al crear práctica externa: ${externalError}`];
      }

      const existingApplication = await practiceApplicationRepository.findOne({
        where: { 
          studentId, 
          internshipExternalId: internshipExternal.id 
        },
      });
      if (existingApplication) {
        return [null, "Ya has enviado una solicitud con estos datos de empresa"];
      }

      applicationData.internshipExternalId = internshipExternal.id;
      applicationData.internshipId = null;
    }

    const newApplication = await practiceApplicationRepository.save(applicationData);
    return [newApplication, null];
  } catch (error) {
    return [null, error.message];
  }
}

export async function getPracticeApplicationsByStudent(studentId) {
  try {
    const applications = await practiceApplicationRepository.find({
      where: { studentId },
      relations: ["internship", "internshipExternal"],
      order: { createdAt: "DESC" },
    });
    return [applications, null];
  } catch (error) {
    return [null, error.message];
  }
}

export async function getPracticeApplicationById(id, requester) {
  try {
    const application = await practiceApplicationRepository.findOne({
      where: { id },
      relations: ["student", "internship", "internshipExternal"]
    });
    
    if (!application) return [null, "Solicitud no encontrada"];

    if (application.studentId !== requester.id && requester.rol !== "administrador") {
      return [null, "No tienes permiso para ver esta solicitud"];
    }

    // Cargar el perfil del estudiante por separado si es necesario
    if (application.student) {
      const profileRepository = AppDataSource.getRepository("Profile");
      application.student.profile = await profileRepository.findOne({
        where: { userId: application.student.id }
      });
    }

    return [application, null];
  } catch (error) {
    return [null, error.message];
  }
}

export async function getAllPracticeApplications(filters) {
  try {
    const where = {};
    if (filters.status) where.status = filters.status;
    if (filters.studentId) where.studentId = filters.studentId;
    if (filters.applicationType) where.applicationType = filters.applicationType;
    if (filters.internshipId) where.internshipId = filters.internshipId;
    if (filters.internshipExternalId) where.internshipExternalId = filters.internshipExternalId;

    const applications = await practiceApplicationRepository.find({
      where,
      relations: ["student", "internship", "internshipExternal"],
      order: { createdAt: "DESC" },
    });

    // Cargar perfiles de estudiantes por separado
    const profileRepository = AppDataSource.getRepository("Profile");
    for (let application of applications) {
      if (application.student) {
        application.student.profile = await profileRepository.findOne({
          where: { userId: application.student.id }
        });
      }
    }

    return [applications, null];
  } catch (error) {
    return [null, error.message];
  }
}

export async function updatePracticeApplication(id, newStatus, coordinatorComments, coordinatorId) {
  try {
    const application = await practiceApplicationRepository.findOneBy({ id });
    if (!application) return [null, "Solicitud no encontrada"];

    if (application.status === "accepted" && newStatus === "needsInfo") {
      return [null, "No se puede volver de accepted a needsInfo"];
    }

    if ((newStatus === "rejected" || newStatus === "needsInfo") && (!coordinatorComments || coordinatorComments.trim() === "")) {
      return [null, "Debes ingresar comentarios del encargado"];
    }

    application.status = newStatus;
    application.coordinatorComments = coordinatorComments || null;
    application.updatedAt = new Date();

    await practiceApplicationRepository.save(application);

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

    return [application, null];
  } catch (error) {
    return [null, error.message];
  }
}

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

export async function cancelPracticeApplication(id, studentId) {
  try {
    const application = await practiceApplicationRepository.findOneBy({ id });
    if (!application) return [null, "Solicitud no encontrada"];
    if (application.studentId !== studentId) return [null, "No tienes permiso"];
    if (application.status !== "pending") {
      return [null, "Solo puedes cancelar solicitudes en estado pending"];
    }

    await practiceApplicationRepository.remove(application);
    return [{ message: "Solicitud cancelada exitosamente" }, null];
  } catch (error) {
    return [null, error.message];
  }
}
