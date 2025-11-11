"use strict";
import {
  getOrCreateProfile,
  updateProfile,
  updateProfileDocuments,
  checkAndUpdateProfileCompletion
} from "../services/profile.service.js";
import { profileValidation, documentsValidation } from "../validations/profile.validation.js";
import {
  handleErrorClient,
  handleErrorServer,
  handleSuccess,
} from "../handlers/responseHandlers.js";

export async function getProfile(req, res) {
  try {
    const userId = req.user.id;
    const [profile, serviceError] = await getOrCreateProfile(userId);

    if (serviceError) {
      return handleErrorClient(res, 400, "Error al obtener el perfil", serviceError);
    }

    handleSuccess(res, 200, "Perfil obtenido exitosamente", profile);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function updateStudentProfile(req, res) {
  try {
    const userId = req.user.id;
    const { body } = req;

    const { error } = profileValidation.validate(body);
    if (error) {
      return handleErrorClient(res, 400, "Error de validacion", error.message);
    }

    const [profile, serviceError] = await updateProfile(userId, body);

    if (serviceError) {
      return handleErrorClient(res, 400, "Error al actualizar el perfil", serviceError);
    }

    await checkAndUpdateProfileCompletion(userId);

    handleSuccess(res, 200, "Perfil actualizado exitosamente", profile);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function updateDocuments(req, res) {
  try {
    const userId = req.user.id;
    const { body } = req;

    const { error } = documentsValidation.validate(body);
    if (error) {
      return handleErrorClient(res, 400, "Error de validacion", error.message);
    }

    const [profile, serviceError] = await updateProfileDocuments(userId, body);

    if (serviceError) {
      return handleErrorClient(res, 400, "Error al actualizar documentos", serviceError);
    }

    await checkAndUpdateProfileCompletion(userId);

    handleSuccess(res, 200, "Documentos actualizados exitosamente", profile);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}
