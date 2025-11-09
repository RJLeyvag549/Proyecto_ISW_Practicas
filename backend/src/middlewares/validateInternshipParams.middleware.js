"use strict";
import { AppDataSource } from "../config/configDb.js";
import { handleErrorClient, handleErrorServer } from "../handlers/responseHandlers.js";

const supervisorRepository = AppDataSource.getRepository("Supervisor");

export async function validateInternshipParams(req, res, next) {
  try {
    const { companyId, supervisorId } = req.params;

    // Verificar que companyId y supervisorId sean números válidos
    if (isNaN(parseInt(companyId)) || (supervisorId && isNaN(parseInt(supervisorId)))) {
      return handleErrorClient(res, 400, "Parámetros inválidos", [
        "companyId y supervisorId deben ser números"
      ]);
    }

    // Si se proporcionó supervisorId, verificar que pertenezca a la empresa indicada
    if (supervisorId) {
      const supervisor = await supervisorRepository.findOne({
        where: { id: parseInt(supervisorId) },
        relations: ["company"]
      });

      if (!supervisor) {
        return handleErrorClient(res, 404, "Supervisor no encontrado");
      }

      if (supervisor.company.id !== parseInt(companyId)) {
        return handleErrorClient(res, 400, "El supervisor no pertenece a la empresa indicada");
      }
    }

    next();
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}
