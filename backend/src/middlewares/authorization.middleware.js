import { AppDataSource } from "../config/configDb.js";
import {
  handleErrorClient,
  handleErrorServer,
} from "../handlers/responseHandlers.js";

const userRepository = AppDataSource.getRepository("User");

export async function isAdmin(req, res, next) {
  try {
    const userFound = await userRepository.findOneBy({ email: req.user.email });

    if (!userFound) {
      return handleErrorClient(
        res,
        404,
        "Usuario no encontrado en la base de datos"
      );
    }

    if (userFound.rol !== "administrador") {
      return handleErrorClient(
        res,
        403,
        "Error al acceder al recurso",
        "Se requiere un rol de administrador para realizar esta acción."
      );
    }
    next();
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function isCoordinator(req, res, next) {
  try {
    const userFound = await userRepository.findOneBy({ email: req.user.email });

    if (!userFound) {
      return handleErrorClient(
        res,
        404,
        "Usuario no encontrado en la base de datos"
      );
    }

    if (userFound.rol !== "coordinador") {
      return handleErrorClient(
        res,
        403,
        "Error al acceder al recurso",
        "Se requiere un rol de coordinador para realizar esta acción."
      );
    }

    next();
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function isAdminOrCoordinator(req, res, next) {
  try {
    const userFound = await userRepository.findOneBy({ email: req.user.email });

    if (!userFound) {
      return handleErrorClient(
        res,
        404,
        "Usuario no encontrado en la base de datos"
      );
    }

    if (userFound.rol !== "administrador" && userFound.rol !== "coordinador") {
      return handleErrorClient(
        res,
        403,
        "Error al acceder al recurso",
        "Se requiere rol de administrador o coordinador para realizar esta acción."
      );
    }

    next();
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}