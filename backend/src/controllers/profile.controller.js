"use strict";
import {
  checkAndUpdateProfileCompletion,
  getOrCreateProfile,
  updateProfile,
  updateProfileDocuments,
} from "../services/profile.service.js";
import { documentsValidation, profileValidation } from "../validations/profile.validation.js";
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
    // Si viene userId en params, usarlo (para admin/coordinador viendo perfil de estudiante)
    // Si no, usar el id del usuario autenticado
    const userId = req.params.userId ? parseInt(req.params.userId) : req.user.id;
    
    // Verificar permisos: el usuario puede ver su propio perfil, o ser admin/coordinador
    const isOwnProfile = userId === req.user.id;
    const isAdminOrCoordinator = req.user.rol === "administrador" || req.user.rol === "coordinador";
    
    if (!isOwnProfile && !isAdminOrCoordinator) {
      return handleErrorClient(res, 403, "No tienes permiso para ver este perfil");
    }
    
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

export async function uploadProfileDocuments(req, res) {
  try {
    const userId = req.user.id;
    const files = Array.isArray(req.files) ? req.files : [];

    if (!files.length) {
      return handleErrorClient(res, 400, "Debe adjuntar al menos un archivo");
    }

    const fileRoutes = files.map(file => `uploads/documents/${file.filename}`);

    const [profile, serviceError] = await updateProfileDocuments(userId, { curriculum: fileRoutes.join(';') });

    if (serviceError) {
      return handleErrorClient(res, 400, "Error al subir documentos", serviceError);
    }

    await checkAndUpdateProfileCompletion(userId);

    handleSuccess(res, 200, "Documentos subidos exitosamente", profile);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function deleteProfileDocuments(req, res) {
  try {
    const userId = req.user.id;
    const { docTypes } = req.body;

    if (!docTypes || !Array.isArray(docTypes) || docTypes.length === 0) {
      return handleErrorClient(res, 400, "Debe especificar qué documentos eliminar");
    }

    // Validar que solo sean tipos válidos
    const validTypes = ['curriculum', 'coverLetter'];
    const invalidTypes = docTypes.filter(type => !validTypes.includes(type));
    if (invalidTypes.length > 0) {
      return handleErrorClient(res, 400, "Tipos de documento inválidos");
    }

    // Crear objeto de actualización con null para los campos a eliminar
    const updateData = {};
    docTypes.forEach(type => {
      updateData[type] = null;
    });

    const [profile, serviceError] = await updateProfileDocuments(userId, updateData);

    if (serviceError) {
      return handleErrorClient(res, 400, "Error al eliminar documentos", serviceError);
    }

    await checkAndUpdateProfileCompletion(userId);

    handleSuccess(res, 200, "Documentos eliminados exitosamente", profile);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}
