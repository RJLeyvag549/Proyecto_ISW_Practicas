"use strict";
import { AppDataSource } from "../config/configDb.js";

const companyRepository = AppDataSource.getRepository("Company");

export async function createCompanyService(companyData) {
  try {
    // Verificar si ya existe empresa con mismo nombre
    const existingCompany = await companyRepository.findOne({
      where: { name: companyData.name },
    });
    if (existingCompany) return [null, "La empresa ya existe"];

    const newCompany = await companyRepository.save(companyData);
    return [newCompany, null];
  } catch (error) {
    return [null, error.message];
  }
}

export async function getAllCompaniesService() {
  try {
    const companies = await companyRepository.find({
      relations: ["supervisors", "internships"],
    });
    return [companies, null];
  } catch (error) {
    return [null, error.message];
  }
}

export async function getCompanyByIdService(companyId) {
  try {
    const company = await companyRepository.findOne({
      where: { id: companyId },
      relations: ["supervisors", "internships"],
    });
    if (!company) return [null, "Empresa no encontrada"];
    return [company, null];
  } catch (error) {
    return [null, error.message];
  }
}

export async function updateCompanyService(companyId, updateData) {
  try {
    await companyRepository.update(companyId, updateData);
    const updatedCompany = await companyRepository.findOne({
      where: { id: companyId },
      relations: ["supervisors", "internships"],
    });
    return [updatedCompany, null];
  } catch (error) {
    return [null, error.message];
  }
}

export async function deleteCompanyService(companyId) {
  try {
    await companyRepository.delete(companyId);
    return [{ message: "Empresa eliminada con éxito" }, null];
  } catch (error) {
    return [null, error.message];
  }
}
