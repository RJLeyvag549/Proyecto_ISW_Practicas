"use strict";
import {
  createInternshipService,
  getAllInternshipsService,
  getInternshipByIdService,
  updateInternshipService,
  deleteInternshipService,
  getInternshipsByCompanyService,
  getInternshipsBySupervisorService
} from "../services/internship.service.js";
import { handleErrorClient, handleErrorServer, handleSuccess } from "../handlers/responseHandlers.js";

export async function createInternship(req, res) {
  try {
    const { companyId, supervisorId } = req.params;
    const [newInternship, error] = await createInternshipService(
      parseInt(companyId),
      parseInt(supervisorId),
      req.body
    );
    if (error) return handleErrorClient(res, 400, "Error creando práctica", error);
    handleSuccess(res, 201, "Práctica creada con éxito", newInternship);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function getAllInternships(req, res) {
  try {
    const [internships, error] = await getAllInternshipsService();
    if (error) return handleErrorClient(res, 400, "Error obteniendo prácticas", error);
    handleSuccess(res, 200, "Prácticas obtenidas con éxito", internships);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function getInternshipById(req, res) {
  try {
    const { id } = req.params;
    const [internship, error] = await getInternshipByIdService(parseInt(id));
    if (error) return handleErrorClient(res, 404, "Práctica no encontrada", error);
    handleSuccess(res, 200, "Práctica obtenida con éxito", internship);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function updateInternship(req, res) {
  try {
    const { id } = req.params;
    const [updatedInternship, error] = await updateInternshipService(parseInt(id), req.body);
    if (error) return handleErrorClient(res, 400, "Error actualizando práctica", error);
    handleSuccess(res, 200, "Práctica actualizada con éxito", updatedInternship);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function deleteInternship(req, res) {
  try {
    const { id } = req.params;
    const [result, error] = await deleteInternshipService(parseInt(id));
    if (error) return handleErrorClient(res, 404, "Error eliminando práctica", error);
    handleSuccess(res, 200, "Práctica eliminada con éxito", result);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

// ✅ Funciones extra
export async function getInternshipsByCompany(req, res) {
  try {
    const { companyId } = req.params;
    const [internships, error] = await getInternshipsByCompanyService(parseInt(companyId));
    if (error) return handleErrorClient(res, 400, "Error obteniendo prácticas por empresa", error);
    handleSuccess(res, 200, "Prácticas por empresa obtenidas con éxito", internships);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function getInternshipsBySupervisor(req, res) {
  try {
    const { companyId, supervisorId } = req.params;
    const [internships, error] = await getInternshipsBySupervisorService(
      parseInt(companyId),
      parseInt(supervisorId)
    );
    if (error) return handleErrorClient(res, 400, "Error obteniendo prácticas por supervisor", error);
    handleSuccess(res, 200, "Prácticas por supervisor obtenidas con éxito", internships);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}
