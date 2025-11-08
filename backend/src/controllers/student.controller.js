"use strict";
import {
  registerStudentService,
  getPendingStudentsService,
  approveStudentService,
} from "../services/student.service.js";
import {
  studentRegisterValidation,
  approvalValidation,
} from "../validations/student.validation.js";
import {
  handleErrorClient,
  handleErrorServer,
  handleSuccess,
} from "../handlers/responseHandlers.js";

export async function registerStudent(req, res) {
  try {
    const { body } = req;
    const { error } = studentRegisterValidation.validate(body);

    if (error)
      return handleErrorClient(res, 400, "Error de validación", error.message);

    const [newUser, errorNewUser] = await registerStudentService(body);

    if (errorNewUser)
      return handleErrorClient(
        res,
        400,
        "Error registrando al estudiante",
        errorNewUser
      );

    handleSuccess(
      res,
      201,
      "Registro exitoso. Tu cuenta está pendiente de aprobación.",
      newUser
    );
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function getPendingStudents(req, res) {
  try {
    const [students, error] = await getPendingStudentsService();

    if (error)
      return handleErrorClient(
        res,
        400,
        "Error obteniendo estudiantes pendientes",
        error
      );

    handleSuccess(
      res,
      200,
      "Estudiantes pendientes recuperados con éxito",
      students
    );
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function approveStudent(req, res) {
  try {
    const { id } = req.params;
    const { body } = req;
    const approverId = req.user.id; // Assuming we have the user in the request from auth middleware

    const { error } = approvalValidation.validate(body);

    if (error)
      return handleErrorClient(res, 400, "Error de validación", error.message);

    const [result, errorResult] = await approveStudentService(
      parseInt(id),
      body,
      approverId
    );

    if (errorResult)
      return handleErrorClient(
        res,
        400,
        "Error procesando al estudiante",
        errorResult
      );

    handleSuccess(res, 200, "Estudiante procesado con éxito", result);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}