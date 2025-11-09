"use strict";
import {
  createCompanyService,
  getAllCompaniesService,
  getCompanyByIdService,
  updateCompanyService,
  deleteCompanyService,
} from "../services/company.service.js";
import { handleErrorClient, handleErrorServer, handleSuccess } from "../handlers/responseHandlers.js";

export async function createCompany(req, res) {
  try {
    const [newCompany, error] = await createCompanyService(req.body);
    if (error) return handleErrorClient(res, 400, "Error creando empresa", error);
    handleSuccess(res, 201, "Empresa creada con éxito", newCompany);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function getAllCompanies(req, res) {
  try {
    const [companies, error] = await getAllCompaniesService();
    if (error) return handleErrorClient(res, 400, "Error obteniendo empresas", error);
    handleSuccess(res, 200, "Empresas obtenidas con éxito", companies);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function getCompanyById(req, res) {
  try {
    const [company, error] = await getCompanyByIdService(parseInt(req.params.id));
    if (error) return handleErrorClient(res, 404, "Empresa no encontrada", error);
    handleSuccess(res, 200, "Empresa obtenida con éxito", company);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function updateCompany(req, res) {
  try {
    const [updatedCompany, error] = await updateCompanyService(parseInt(req.params.id), req.body);
    if (error) return handleErrorClient(res, 400, "Error actualizando empresa", error);
    handleSuccess(res, 200, "Empresa actualizada con éxito", updatedCompany);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function deleteCompany(req, res) {
  try {
    const [result, error] = await deleteCompanyService(parseInt(req.params.id));
    if (error) return handleErrorClient(res, 400, "Error eliminando empresa", error);
    handleSuccess(res, 200, "Empresa eliminada con éxito", result);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}
