"use strict";
import { AppDataSource } from "../config/configDb.js";
import { encryptPassword } from "../helpers/bcrypt.helper.js";
import { sendEmail } from "../helpers/email.helper.js";

const userRepository = AppDataSource.getRepository("User");

export async function registerStudentService(userData) {
  try {
    const existingUser = await userRepository.findOne({
      where: [{ email: userData.email }, { rut: userData.rut }],
    });

    const createErrorMessage = (dataInfo, message) => ({ dataInfo, message });

    if (existingUser) {
      if (existingUser.email === userData.email)
        return [null, createErrorMessage("email", "El correo ya está registrado")];
      if (existingUser.rut === userData.rut)
        return [null, createErrorMessage("rut", "El RUT ya está registrado")];
    }

    const hashedPassword = await encryptPassword(userData.password);
    const newUser = await userRepository.save({
      ...userData,
      password: hashedPassword,
      rol: "estudiante",
      status: "pending",
    });

    // Send email notification
    await sendEmail(
      userData.email,
      "Registro pendiente de aprobación",
      `Hola ${userData.nombreCompleto || ''},\n\nTu cuenta ha sido creada exitosamente y está pendiente de aprobación por el encargado de prácticas. Te notificaremos cuando tu cuenta sea revisada.\n\nSaludos,\nEquipo de Prácticas`,
      `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #2b7cff, #4aa3ff); color: white; padding: 20px; border-radius: 8px; text-align: center;">
            <h1 style="margin:0; font-size:20px">Registro pendiente de aprobación</h1>
          </div>
          <div style="background-color: #ffffff; padding: 20px; border-radius: 0 0 8px 8px;">
            <p>Hola ${userData.nombreCompleto || ''},</p>
            <p>Tu cuenta ha sido creada exitosamente y está pendiente de aprobación por el encargado de prácticas. Te notificaremos cuando tu cuenta sea revisada.</p>
            <p>Saludos,<br/><strong>Equipo de Prácticas</strong></p>
          </div>
        </div>
      `
    );

    const { password, ...userWithoutPassword } = newUser;
    return [userWithoutPassword, null];
  } catch (error) {
    const createErrorMessage = (dataInfo, message) => ({ dataInfo, message });
    return [null, createErrorMessage("server", error.message)];
  }
}

export async function getPendingStudentsService() {
  try {
    const pendingStudents = await userRepository.find({
      where: {
        status: "pending",
        rol: "estudiante",
      },
      // return all fields except password so admin can inspect full submission
    });
    const studentsData = pendingStudents.map(({ password, ...u }) => u);
    return [studentsData, null];
  } catch (error) {
    return [null, error.message];
  }
}

export async function getPendingStudentService(studentId) {
  try {
    const student = await userRepository.findOne({
      where: { id: studentId, rol: "estudiante", status: "pending" },
    });

    if (!student) return [null, "Estudiante pendiente no encontrado"];

    const { password, ...studentData } = student;
    return [studentData, null];
  } catch (error) {
    return [null, error.message];
  }
}

export async function approveStudentService(studentId, approvalData, approverId) {
  try {
    const student = await userRepository.findOne({
      where: { id: studentId, rol: "estudiante" },
    });

    if (!student) return [null, "Estudiante no encontrado"];
    if (student.status !== "pending")
      return [null, "Este estudiante ya ha sido procesado"];

    if (approvalData.approved) {
      const updateData = {
        status: "approved",
        approvedBy: approverId,
        approvalDate: new Date(),
      };

      await userRepository.update(studentId, updateData);

      const emailSubject = "Registro aprobado";
      const emailText = `Hola ${student.nombreCompleto || ''},\n\nTu cuenta ha sido aprobada. Ya puedes acceder al sistema.\n\nSaludos,\nEquipo de Prácticas`;
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width:600px;margin:0 auto;">
          <div style="background:#dff7e0;padding:18px;border-radius:8px;text-align:center;color:#1a7f2e;">
            <h2 style="margin:0">Registro aprobado</h2>
          </div>
          <div style="background:#fff;padding:20px;border-radius:0 0 8px 8px;">
            <p>Hola ${student.nombreCompleto || ''},</p>
            <p>Tu cuenta ha sido <strong>aprobada</strong>. Ya puedes acceder al sistema con tus credenciales.</p>
            <p>Saludos,<br/><strong>Equipo de Prácticas</strong></p>
          </div>
        </div>
      `;

      await sendEmail(student.email, emailSubject, emailText, emailHtml);

      return [{ message: "Estudiante aprobado con éxito" }, null];
    } else {
      // En caso de rechazo, enviar notificación y eliminar el registro en lugar de guardarlo
      const emailSubject = "Registro rechazado";
      const emailText = `Hola ${student.nombreCompleto || ''},\n\nTu cuenta ha sido rechazada. Motivo: ${approvalData.rejectionReason}\n\nSaludos,\nEquipo de Prácticas`;
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width:600px;margin:0 auto;">
          <div style="background:#ffe6e6;padding:18px;border-radius:8px;text-align:center;color:#b30000;">
            <h2 style="margin:0">Registro rechazado</h2>
          </div>
          <div style="background:#fff;padding:20px;border-radius:0 0 8px 8px;">
            <p>Hola ${student.nombreCompleto || ''},</p>
            <p>Tu cuenta ha sido <strong>rechazada</strong>.</p>
            <p><strong>Motivo:</strong> ${approvalData.rejectionReason || 'No especificado'}</p>
            <p>Si crees que hay un error, contacta con el encargado de prácticas.</p>
            <p>Saludos,<br/><strong>Equipo de Prácticas</strong></p>
          </div>
        </div>
      `;

      await sendEmail(student.email, emailSubject, emailText, emailHtml);

      await userRepository.delete(studentId);

      return [{ message: "Estudiante rechazado y eliminado" }, null];
    }
  } catch (error) {
    return [null, error.message];
  }
}