"use strict";
import { AppDataSource } from "../config/configDb.js";
import PracticeApplicationSchema from "../entity/practiceApplication.entity.js";
import { sendEmail } from "../helpers/email.helper.js";
import { createInternshipExternal, updateInternshipExternal, deleteInternshipExternal } from "./internshipExternal.service.js";

const practiceApplicationRepository = AppDataSource.getRepository("PracticeApplication");
const documentRepository = AppDataSource.getRepository("Document");
const userRepository = AppDataSource.getRepository("User");
const internshipRepository = AppDataSource.getRepository("Internship");
const internshipExternalRepository = AppDataSource.getRepository("InternshipExternal");

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
      if (existingApplication && existingApplication.status !== 'rejected') {
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
      relations: ["internship", "internshipExternal", "documents"],
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
      relations: ["student", "internship", "internshipExternal", "documents"]
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
      relations: ["student", "internship", "internshipExternal", "documents"],
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

export async function updatePracticeApplication(id, newStatus, coordinatorComments, coordinatorId, force = false) {
  try {
    const application = await practiceApplicationRepository.findOne({
      where: { id },
      relations: ["student", "internship", "internship.company", "internship.supervisor", "internshipExternal"]
    });
    if (!application) return [null, "Solicitud no encontrada"];

    // Cupos para ofertas internas (existing):
    // - Al pasar a accepted, incrementar occupiedSlots.
    // - Si no hay cupos disponibles, rechazar la aprobación.
    // - Evitar incrementar dos veces si ya estaba accepted.
    if (
      application.applicationType === "existing"
      && application.internshipId
      && newStatus === "accepted"
      && application.status !== "accepted"
    ) {
      const internship = await internshipRepository.findOne({
        where: { id: application.internshipId },
      });

      if (!internship) return [null, "Oferta de práctica no encontrada"];

      const total = Number(internship.totalSlots ?? 0);
      const occupied = Number(internship.occupiedSlots ?? 0);

      if (occupied >= total) {
        const title = internship.title ? `"${internship.title}"` : "esta oferta";
        return [
          null,
          `No se puede aprobar la solicitud: los cupos para ${title} están completos (${occupied}/${total}).`
        ];
      }

      internship.occupiedSlots = occupied + 1;
      await internshipRepository.save(internship);
    }

    // Regla de negocio: un estudiante no puede tener más de una solicitud aprobada.
    if (newStatus === "accepted" && !force) {
      const alreadyAccepted = await practiceApplicationRepository
        .createQueryBuilder("pa")
        .where("pa.studentId = :studentId", { studentId: application.studentId })
        .andWhere("pa.status = :status", { status: "accepted" })
        .andWhere("pa.id <> :id", { id })
        .getExists();

      if (alreadyAccepted) {
        return [
          null,
          {
            warning: true,
            code: "STUDENT_ALREADY_HAS_ACCEPTED_APPLICATION",
            message:
              "Este estudiante ya cuenta con una solicitud aprobada. "
              + "¿Estás seguro que deseas aprobar esta solicitud también?",
          }
        ];
      }
    }

    // No permitir modificar solicitudes ya rechazadas
    if (application.status === "rejected") {
      return [null, "No se puede modificar una solicitud que ya fue rechazada"];
    }

    if (application.status === "accepted" && newStatus === "needsInfo") {
      return [null, "No se puede volver de accepted a needsInfo"];
    }

    const needsComments = newStatus === "rejected" || newStatus === "needsInfo";
    if (needsComments && (!coordinatorComments || coordinatorComments.trim() === "")) {
      return [null, "Debes ingresar comentarios del encargado"];
    }

    application.status = newStatus;
    application.coordinatorComments = coordinatorComments || null;
    application.updatedAt = new Date();

    await practiceApplicationRepository.save(application);

    const student = application.student || await userRepository.findOneBy({ id: application.studentId });

    if (student && student.email) {
      let subject, textBody, htmlBody;
      const studentName = student.nombreCompleto || student.email;
      const practiceName =
        application.internship?.title
        || application.internshipExternal?.companyName
        || "tu práctica";

      if (newStatus === "accepted") {
        subject = "✅ Solicitud de Práctica Aceptada - Universidad del Bío-Bío";
        textBody = `Hola ${studentName},\n\nTu solicitud de práctica para "${practiceName}" ha sido ACEPTADA.\n\n${coordinatorComments ? `Comentarios del encargado: ${coordinatorComments}` : ""}\n\nSaludos,\nSistema de Prácticas UBB`;
        htmlBody = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #2d9b83; padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 0;">Sistema de Prácticas UBB</h1>
            </div>
            <div style="padding: 30px; background-color: #f5f5f5;">
              <h2 style="color: #2d9b83;">¡Felicitaciones, ${studentName}!</h2>
              <p style="font-size: 16px;">Tu solicitud de práctica para <strong>"${practiceName}"</strong> ha sido <span style="color: #28a745; font-weight: bold;">ACEPTADA</span>.</p>
              ${coordinatorComments ? `<div style="background-color: #e8f5e9; padding: 15px; border-left: 4px solid #28a745; margin: 20px 0;"><strong>Comentarios del encargado:</strong><br>${coordinatorComments}</div>` : ""}
              <p>Ingresa al sistema para ver más detalles.</p>
            </div>
            <div style="background-color: #333; color: white; padding: 15px; text-align: center; font-size: 12px;">
              Universidad del Bío-Bío - Sistema de Gestión de Prácticas
            </div>
          </div>
        `;
      } else if (newStatus === "rejected") {
        subject = "❌ Solicitud de Práctica Rechazada - Universidad del Bío-Bío";
        textBody = `Hola ${studentName},\n\nLamentamos informarte que tu solicitud de práctica para "${practiceName}" ha sido RECHAZADA.\n\nComentarios del encargado: ${coordinatorComments}\n\nSaludos,\nSistema de Prácticas UBB`;
        htmlBody = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #2d9b83; padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 0;">Sistema de Prácticas UBB</h1>
            </div>
            <div style="padding: 30px; background-color: #f5f5f5;">
              <h2 style="color: #dc3545;">${studentName}, tu solicitud ha sido rechazada</h2>
              <p style="font-size: 16px;">Tu solicitud de práctica para <strong>"${practiceName}"</strong> ha sido <span style="color: #dc3545; font-weight: bold;">RECHAZADA</span>.</p>
              <div style="background-color: #ffebee; padding: 15px; border-left: 4px solid #dc3545; margin: 20px 0;">
                <strong>Comentarios del encargado:</strong><br>${coordinatorComments}
              </div>
              <p>Si tienes dudas, puedes contactar al encargado de prácticas.</p>
            </div>
            <div style="background-color: #333; color: white; padding: 15px; text-align: center; font-size: 12px;">
              Universidad del Bío-Bío - Sistema de Gestión de Prácticas
            </div>
          </div>
        `;
      } else if (newStatus === "needsInfo") {
        subject = "📋 Se Requiere Información Adicional - Universidad del Bío-Bío";
        textBody = `Hola ${studentName},\n\nTu solicitud de práctica para "${practiceName}" requiere información adicional.\n\nComentarios del encargado: ${coordinatorComments}\n\nPor favor, ingresa al sistema para actualizar tu solicitud.\n\nSaludos,\nSistema de Prácticas UBB`;
        htmlBody = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #2d9b83; padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 0;">Sistema de Prácticas UBB</h1>
            </div>
            <div style="padding: 30px; background-color: #f5f5f5;">
              <h2 style="color: #ff9800;">${studentName}, necesitamos más información</h2>
              <p style="font-size: 16px;">Tu solicitud de práctica para <strong>"${practiceName}"</strong> requiere <span style="color: #ff9800; font-weight: bold;">INFORMACIÓN ADICIONAL</span>.</p>
              <div style="background-color: #fff3e0; padding: 15px; border-left: 4px solid #ff9800; margin: 20px 0;">
                <strong>Comentarios del encargado:</strong><br>${coordinatorComments}
              </div>
              <p><strong>Por favor, ingresa al sistema para actualizar tu solicitud.</strong></p>
            </div>
            <div style="background-color: #333; color: white; padding: 15px; text-align: center; font-size: 12px;">
              Universidad del Bío-Bío - Sistema de Gestión de Prácticas
            </div>
          </div>
        `;
      }

      // Enviar el correo electrónico
      if (subject && textBody) {
        const [emailSent, emailError] = await sendEmail(student.email, subject, textBody, htmlBody);
        if (emailError) {
          console.warn(`[updatePracticeApplication] No se pudo enviar correo a ${student.email}: ${emailError}`);
        } else {
          console.log(`[updatePracticeApplication] Correo enviado exitosamente a ${student.email}`);
        }
      }
    }

    return [application, null];
  } catch (error) {
    return [null, error.message];
  }
}

export async function updateOwnPracticeApplication(id, studentId, data) {
  try {
    const application = await practiceApplicationRepository.findOne({ where: { id }, relations: ["internshipExternal"] });
    if (!application) return [null, "Solicitud no encontrada"];
    if (application.studentId !== studentId) return [null, "No tienes permiso"];
    if (!["pending", "needsInfo"].includes(application.status)) {
      return [null, "Solo puedes editar solicitudes en estado pending o needsInfo"];
    }
    if (application.applicationType !== "external") {
      return [null, "Solo se pueden editar solicitudes externas"];
    }

    // Actualizar datos de la práctica externa si se envía companyData
    if (data.companyData) {
      const [updatedExternal, externalError] = await updateInternshipExternal(
        application.internshipExternalId,
        studentId,
        data.companyData
      );
      if (externalError) return [null, externalError];
      application.internshipExternal = updatedExternal;
    }

    application.updatedAt = new Date();
    const saved = await practiceApplicationRepository.save(application);
    return [saved, null];
  } catch (error) {
    return [null, error.message];
  }
}

export async function deleteOwnPracticeApplication(id, studentId) {
  try {
    const application = await practiceApplicationRepository.findOne({ where: { id }, relations: ["internshipExternal"] });
    if (!application) return [null, "Solicitud no encontrada"];
    if (application.studentId !== studentId) return [null, "No tienes permiso"];
    if (!["pending", "needsInfo"].includes(application.status)) {
      return [null, "Solo puedes eliminar solicitudes en estado pending o needsInfo"];
    }

    // Si es externa, eliminar primero la práctica externa ligada
    if (application.applicationType === "external" && application.internshipExternalId) {
      await deleteInternshipExternal(application.internshipExternalId, studentId);
    }

    await practiceApplicationRepository.remove(application);
    return [{ message: "Solicitud eliminada" }, null];
  } catch (error) {
    return [null, error.message];
  }
}


export async function closePracticeApplication(id, options = {}) {
  const MIN_AVERAGE = typeof options.minAverage === "number" ? options.minAverage : 4.0;
  try {
    const application = await practiceApplicationRepository.findOneBy({ id });
    if (!application) return [null, "Solicitud no encontrada"];

    if (application.isClosed) return [null, "La práctica ya se encuentra cerrada"];

    const documents = await documentRepository.find({ where: { practiceApplicationId: id } });

    if (documents.length === 0) return [null, "No hay documentos asociados a la práctica"];

    const missingGrades = documents.filter((d) => d.grade == null);
    if (missingGrades.length > 0) {
      return [null, "Existen documentos sin nota de evaluación"];
    }

    const avg = Number(
      (
        documents.reduce((acc, d) => acc + Number(d.grade), 0) / documents.length
      ).toFixed(1),
    );

    application.finalAverage = avg;
    application.finalResult = avg >= MIN_AVERAGE ? "approved" : "failed";
    application.isClosed = true;
    application.closedAt = new Date();
    application.updatedAt = new Date();

    await practiceApplicationRepository.save(application);
    return [application, null];
  } catch (error) {
    return [null, error.message];
  }
}
