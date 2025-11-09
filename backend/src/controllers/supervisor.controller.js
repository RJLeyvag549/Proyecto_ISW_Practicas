"use strict";
import {
  createSupervisorService,
  getAllSupervisorsService,
  getSupervisorByIdService,
  updateSupervisorService,
  deleteSupervisorService
} from "../services/supervisor.service.js";
import { handleErrorClient, handleErrorServer, handleSuccess } from "../handlers/responseHandlers.js";

export async function createSupervisor(req, res) {
  try {
    const { companyId } = req.params;
    const [newSupervisor, error] = await createSupervisorService({ ...req.body, companyId: parseInt(companyId) });
    if (error) return handleErrorClient(res, 400, "Error creando supervisor", error);
    handleSuccess(res, 201, "Supervisor creado con éxito", newSupervisor);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function getAllSupervisors(req, res) {
  try {
    const { companyId } = req.params;
    const [supervisors, error] = await getAllSupervisorsService(parseInt(companyId));
    if (error) return handleErrorClient(res, 400, "Error obteniendo supervisores", error);
    handleSuccess(res, 200, "Supervisores obtenidos con éxito", supervisors);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function getSupervisorById(req, res) {
  try {
    const { companyId, id } = req.params;
    const [supervisor, error] = await getSupervisorByIdService(parseInt(id), parseInt(companyId));
    if (error) return handleErrorClient(res, 404, "Error obteniendo supervisor", error);
    handleSuccess(res, 200, "Supervisor obtenido con éxito", supervisor);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function updateSupervisor(req, res) {
  try {
    const { companyId, id } = req.params;
    const [updatedSupervisor, error] = await updateSupervisorService(parseInt(id), parseInt(companyId), req.body);
    if (error) return handleErrorClient(res, 400, "Error actualizando supervisor", error);
    handleSuccess(res, 200, "Supervisor actualizado con éxito", updatedSupervisor);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function deleteSupervisor(req, res) {
  try {
    const { companyId, id } = req.params;
    const [result, error] = await deleteSupervisorService(parseInt(id), parseInt(companyId));
    if (error) return handleErrorClient(res, 404, "Error eliminando supervisor", error);
    handleSuccess(res, 200, "Supervisor eliminado con éxito", result);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}
