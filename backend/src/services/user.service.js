"use strict";
import User from "../entity/user.entity.js";
import { AppDataSource } from "../config/configDb.js";
import { comparePassword, encryptPassword } from "../helpers/bcrypt.helper.js";

export async function getUserService(query) {
  try {
    const { rut, id, email } = query;

    const userRepository = AppDataSource.getRepository(User);

    const userFound = await userRepository.findOne({
      where: [{ id: id }, { rut: rut }, { email: email }],
    });

    if (!userFound) return [null, "Usuario no encontrado"];

    const { password, ...userData } = userFound;

    return [userData, null];
  } catch (error) {
    console.error("Error obtener el usuario:", error);
    return [null, "Error interno del servidor"];
  }
}

export async function getUsersService() {
  try {
    const userRepository = AppDataSource.getRepository(User);

    // Exclude users that are still pending approval so they don't appear
    // in the main users list. Only return users whose status is different
    // from 'pending' (e.g., approved, rejected, etc.).
    const users = await userRepository
      .createQueryBuilder('user')
      .where('user.status != :status', { status: 'pending' })
      .getMany();

    // Return an empty array (not an error) when there are no users to allow
    // controllers to respond with 204 No Content if desired.
    if (!users || users.length === 0) return [[], null];

    const usersData = users.map(({ password, ...user }) => user);

    return [usersData, null];
  } catch (error) {
    console.error("Error al obtener a los usuarios:", error);
    return [null, "Error interno del servidor"];
  }
}

export async function updateUserService(query, body) {
  try {
    const { id, rut, email } = query;

    const userRepository = AppDataSource.getRepository(User);

    const userFound = await userRepository.findOne({
      where: [{ id: id }, { rut: rut }, { email: email }],
    });

    if (!userFound) return [null, "Usuario no encontrado"];

    // Solo verificar colisión por email cuando se desea cambiar el correo
    let existingUser = null;
    if (body.email) {
      existingUser = await userRepository.findOne({ where: { email: body.email } });
      if (existingUser && existingUser.id !== userFound.id) {
        return [null, "Ya existe un usuario con el mismo email"];
      }
    }

    if (body.password) {
      const matchPassword = await comparePassword(
        body.password,
        userFound.password,
      );

      if (!matchPassword) return [null, "La contraseña no coincide"];
    }

    const dataUserUpdate = {
      email: body.email,
      rol: body.rol,
      updatedAt: new Date(),
    };

    if (body.newPassword && body.newPassword.trim() !== "") {
      dataUserUpdate.password = await encryptPassword(body.newPassword);
    }

    await userRepository.update({ id: userFound.id }, dataUserUpdate);

    const userData = await userRepository.findOne({
      where: { id: userFound.id },
    });

    if (!userData) {
      return [null, "Usuario no encontrado después de actualizar"];
    }

    const { password, ...userUpdated } = userData;

    return [userUpdated, null];
  } catch (error) {
    console.error("Error al modificar un usuario:", error);
    return [null, "Error interno del servidor"];
  }
}

export async function deleteUserService(query) {
  try {
    const { id, rut, email } = query;

    const userRepository = AppDataSource.getRepository(User);

    // Build a precise search condition to avoid ambiguous null/undefined matches
    let searchCondition = null;
    if (id !== undefined && id !== null && id !== '') {
      searchCondition = { id: Number(id) };
    } else if (rut) {
      searchCondition = { rut };
    } else if (email) {
      searchCondition = { email };
    }

    console.log('deleteUserService - searchCondition:', searchCondition);

    let userFound = null;
    if (searchCondition) {
      // If searching by rut, try a normalized search that ignores dots (frontend may send formatted rut)
      if (searchCondition.rut) {
        const rawRut = String(searchCondition.rut).trim();
        const normRut = rawRut.replace(/\./g, "");
        try {
          userFound = await userRepository
            .createQueryBuilder('user')
            .where("replace(user.rut, '.', '') = :normRut", { normRut })
            .orWhere('user.rut = :rawRut', { rawRut })
            .getOne();
        } catch (err) {
          console.error('Error queryBuilder rut search:', err);
          userFound = await userRepository.findOne({ where: { rut: rawRut } });
        }
      } else {
        userFound = await userRepository.findOne({ where: searchCondition });
      }
    }

    console.log('deleteUserService - userFound:', userFound ? userFound.id : null);

    if (!userFound) return [null, "Usuario no encontrado"];

    if (userFound.rol === "administrador") {
      return [null, "No se puede eliminar un usuario con rol de administrador"];
    }

    const userDeleted = await userRepository.remove(userFound);

    const { password, ...dataUser } = userDeleted;

    return [dataUser, null];
  } catch (error) {
    console.error("Error al eliminar un usuario:", error);
    return [null, "Error interno del servidor"];
  }
}