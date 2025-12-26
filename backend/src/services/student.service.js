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
      rol: "usuario",  // Cambiado de "estudiante" a "usuario" para consistencia
      status: "pending",
    });

    // Send email notification
    await sendEmail(
      userData.email,
      "Registro pendiente de aprobación",
      "Tu cuenta ha sido creada exitosamente y está pendiente de aprobación por el encargado de prácticas. Te notificaremos cuando tu cuenta sea revisada."
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
        rol: "usuario",
      },
      select: ["id", "nombreCompleto", "rut", "email", "createdAt"],
    });
    return [pendingStudents, null];
  } catch (error) {
    return [null, error.message];
  }
}

export async function approveStudentService(studentId, approvalData, approverId) {
  try {
    const student = await userRepository.findOne({
      where: { id: studentId, rol: "usuario" },
    });

    if (!student) return [null, "Estudiante no encontrado"];
    if (student.status !== "pending")
      return [null, "Este estudiante ya ha sido procesado"];

    const status = approvalData.approved ? "approved" : "rejected";
    const updateData = {
      status,
      approvedBy: approverId,
      approvalDate: new Date(),
      rejectionReason: approvalData.rejectionReason,
    };

    await userRepository.update(studentId, updateData);

    // Send email notification
    const emailSubject = approvalData.approved
      ? "Registro aprobado"
      : "Registro rechazado";
    const emailBody = approvalData.approved
      ? "Tu cuenta ha sido aprobada. Ya puedes acceder al sistema."
      : `Tu cuenta ha sido rechazada. Motivo: ${approvalData.rejectionReason}`;

    await sendEmail(student.email, emailSubject, emailBody);

    return [{ message: "Estudiante procesado con éxito" }, null];
  } catch (error) {
    return [null, error.message];
  }
}