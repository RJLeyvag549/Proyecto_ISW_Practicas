"use strict";
import User from "../entity/user.entity.js";
import { AppDataSource } from "./configDb.js";
import { encryptPassword } from "../helpers/bcrypt.helper.js";

async function createUsers() {
  try {
    const userRepository = AppDataSource.getRepository(User);

    const count = await userRepository.count();
    if (count > 0) return;

    await Promise.all([
      userRepository.save(
        userRepository.create({
          nombreCompleto: "Carlos Martínez López",
          rut: "11.111.111-1",
          email: "admin@test.com",
          password: await encryptPassword("test1234"),
          rol: "administrador",
          status: "approved",
        }),
      ),
      userRepository.save(
        userRepository.create({
          nombreCompleto: "María González Rodríguez",
          rut: "22.222.222-2",
          email: "estudiante1@test.com",
          password: await encryptPassword("test1234"),
          rol: "estudiante",
          status: "approved",
        })
      ),
        userRepository.save(
          userRepository.create({
            nombreCompleto: "Juan Pérez García",
            rut: "33.333.333-3",
            email: "estudiante2@test.com",
            password: await encryptPassword("test1234"),
            rol: "estudiante",
            status: "approved",
          }),
      ),
      userRepository.save(
        userRepository.create({
          nombreCompleto: "Ana Silva Hernández",
          rut: "44.444.444-4",
          email: "estudiante3@test.com",
          password: await encryptPassword("test1234"),
          rol: "estudiante",
          status: "approved",
        }),
      ),
      userRepository.save(
        userRepository.create({
          nombreCompleto: "Roberto Fernández Soto",
          rut: "55.555.555-5",
          email: "estudiante4@test.com",
          password: await encryptPassword("test1234"),
          rol: "estudiante",
          status: "approved",
        }),
      ),
      userRepository.save(
        userRepository.create({
          nombreCompleto: "Sandra Romero Díaz",
          rut: "66.666.666-6",
          email: "estudiante5@test.com",
          password: await encryptPassword("test1234"),
          rol: "estudiante",
          status: "approved",
        }),
      ),
    ]);
    console.log("* => Usuarios creados exitosamente");
  } catch (error) {
    console.error("Error al crear usuarios:", error);
  }
}

export { createUsers };