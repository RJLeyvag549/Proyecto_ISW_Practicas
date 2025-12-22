"use strict";
import {
  getOrCreateProfile,
  updateProfile,
  updateProfileDocuments,
  checkAndUpdateProfileCompletion
} from "../services/profile.service.js";
import { profileValidation, documentsValidation } from "../validations/profile.validation.js";
import { passwordChangeValidation } from "../validations/user.validation.js";
import { AppDataSource } from "../config/configDb.js";
import User from "../entity/user.entity.js";
import { comparePassword, encryptPassword } from "../helpers/bcrypt.helper.js";
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

export async function updatePassword(req, res) {
  try {
    const userId = req.user.id;
    const { body } = req;

    const { error } = passwordChangeValidation.validate(body);
    if (error) {
      return handleErrorClient(res, 400, "Error de validacion", error.message);
    }

    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({ where: { id: userId } });
    if (!user) {
      return handleErrorClient(res, 404, "Usuario no encontrado");
    }

    const ok = await comparePassword(body.password, user.password);
    if (!ok) {
      return handleErrorClient(res, 400, "La contraseña actual no es correcta");
    }

    const newHashed = await encryptPassword(body.newPassword);
    await userRepo.update({ id: userId }, { password: newHashed, updatedAt: new Date() });

    handleSuccess(res, 200, "Contraseña actualizada exitosamente");
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
