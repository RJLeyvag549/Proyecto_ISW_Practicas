"use strict";
import { AppDataSource } from "../config/configDb.js";

const internshipRepository = AppDataSource.getRepository("Internship");
const companyRepository = AppDataSource.getRepository("Company");
const supervisorRepository = AppDataSource.getRepository("Supervisor");

export async function createInternshipService(companyId, supervisorId, internshipData) {
  try {
    const company = await companyRepository.findOne({ where: { id: companyId } });
    if (!company) return [null, "Empresa no encontrada"];

    const supervisor = await supervisorRepository.findOne({ where: { id: supervisorId, company: { id: companyId } } });
    if (!supervisor) return [null, "Supervisor no encontrado en la empresa seleccionada"];

    const newInternship = await internshipRepository.save({
      ...internshipData,
      company,
      supervisor
    });

    return [newInternship, null];
  } catch (error) {
    return [null, error.message];
  }
}

export async function getAllInternshipsService() {
  try {
    const internships = await internshipRepository.find({ relations: ["company", "supervisor"] });
    return [internships, null];
  } catch (error) {
    return [null, error.message];
  }
}

export async function getInternshipByIdService(id) {
  try {
    const internship = await internshipRepository.findOne({ where: { id }, relations: ["company", "supervisor"] });
    if (!internship) return [null, "Práctica no encontrada"];
    return [internship, null];
  } catch (error) {
    return [null, error.message];
  }
}

export async function updateInternshipService(id, updateData) {
  try {
    const internship = await internshipRepository.findOne({ where: { id }, relations: ["company", "supervisor"] });
    if (!internship) return [null, "Práctica no encontrada"];

    if (updateData.companyId) {
      const company = await companyRepository.findOne({ where: { id: updateData.companyId } });
      if (!company) return [null, "Empresa no encontrada"];
      internship.company = company;
    }

    if (updateData.supervisorId) {
      const supervisor = await supervisorRepository.findOne({ where: { id: updateData.supervisorId, company: { id: internship.company.id } } });
      if (!supervisor) return [null, "Supervisor no encontrado en la empresa"];
      internship.supervisor = supervisor;
    }

    const updatedInternship = await internshipRepository.save({ ...internship, ...updateData });
    return [updatedInternship, null];
  } catch (error) {
    return [null, error.message];
  }
}

export async function deleteInternshipService(id) {
  try {
    const internship = await internshipRepository.findOne({ where: { id } });
    if (!internship) return [null, "Práctica no encontrada"];

    await internshipRepository.remove(internship);
    return [{ message: "Práctica eliminada con éxito" }, null];
  } catch (error) {
    return [null, error.message];
  }
}

// Funciones extra
export async function getInternshipsByCompanyService(companyId) {
  try {
    const internships = await internshipRepository.find({ where: { company: { id: companyId } }, relations: ["supervisor"] });
    return [internships, null];
  } catch (error) {
    return [null, error.message];
  }
}

export async function getInternshipsBySupervisorService(companyId, supervisorId) {
  try {
    const internships = await internshipRepository.find({
      where: { company: { id: companyId }, supervisor: { id: supervisorId } },
      relations: ["supervisor"]
    });
    return [internships, null];
  } catch (error) {
    return [null, error.message];
  }
}
