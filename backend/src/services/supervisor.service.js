"use strict";
import { AppDataSource } from "../config/configDb.js";

const supervisorRepository = AppDataSource.getRepository("Supervisor");
const companyRepository = AppDataSource.getRepository("Company");

export async function createSupervisorService(supervisorData) {
  try {
    const company = await companyRepository.findOne({ where: { id: supervisorData.companyId } });
    if (!company) return [null, "Empresa no encontrada"];

    const newSupervisor = await supervisorRepository.save({
      fullName: supervisorData.fullName,
      email: supervisorData.email,
      phone: supervisorData.phone,
      specialtyArea: supervisorData.specialtyArea,
      company: company
    });

    return [newSupervisor, null];
  } catch (error) {
    return [null, error.message];
  }
}

export async function getAllSupervisorsService(companyId) {
  try {
    const supervisors = await supervisorRepository.find({
      where: { company: { id: companyId } },
      relations: ["company"]
    });
    return [supervisors, null];
  } catch (error) {
    return [null, error.message];
  }
}

export async function getSupervisorByIdService(id, companyId) {
  try {
    const supervisor = await supervisorRepository.findOne({
      where: { id, company: { id: companyId } },
      relations: ["company"]
    });
    if (!supervisor) return [null, "Supervisor no encontrado"];
    return [supervisor, null];
  } catch (error) {
    return [null, error.message];
  }
}

export async function updateSupervisorService(id, companyId, updateData) {
  try {
    const supervisor = await supervisorRepository.findOne({
      where: { id, company: { id: companyId } },
      relations: ["company"]
    });
    if (!supervisor) return [null, "Supervisor no encontrado"];

    if (updateData.companyId) {
      const company = await companyRepository.findOne({ where: { id: updateData.companyId } });
      if (!company) return [null, "Empresa no encontrada"];
      supervisor.company = company;
    }

    const updatedSupervisor = await supervisorRepository.save({ ...supervisor, ...updateData });
    return [updatedSupervisor, null];
  } catch (error) {
    return [null, error.message];
  }
}

export async function deleteSupervisorService(id, companyId) {
  try {
    const supervisor = await supervisorRepository.findOne({
      where: { id, company: { id: companyId } }
    });
    if (!supervisor) return [null, "Supervisor no encontrado"];

    await supervisorRepository.remove(supervisor);
    return [{ message: "Supervisor eliminado con éxito" }, null];
  } catch (error) {
    return [null, error.message];
  }
}
