"use strict";
import { AppDataSource } from "../config/configDb.js";
import InternshipExternalSchema from "../entity/internshipExternal.entity.js";

const internshipExternalRepository = AppDataSource.getRepository("InternshipExternal");

export async function createInternshipExternal(studentId, data) {
  try {
    const newInternshipExternal = await internshipExternalRepository.save({
      studentId,
      title: data.title,
      description: data.description,
      companyName: data.companyName,
      companyAddress: data.companyAddress,
      companyIndustry: data.companyIndustry || null,
      companyWebsite: data.companyWebsite || null,
      companyPhone: data.companyPhone || null,
      companyEmail: data.companyEmail || null,
      supervisorName: data.supervisorName,
      supervisorPosition: data.supervisorPosition,
      supervisorEmail: data.supervisorEmail,
      supervisorPhone: data.supervisorPhone || null,
      department: data.department || null,
      activities: data.activities,
      estimatedDuration: data.estimatedDuration,
      schedule: data.schedule,
      specialtyArea: data.specialtyArea || null,
    });

    return [newInternshipExternal, null];
  } catch (error) {
    return [null, error.message];
  }
}

export async function updateInternshipExternal(internshipExternalId, studentId, data) {
  try {
    const existing = await internshipExternalRepository.findOne({ where: { id: internshipExternalId, studentId } });
    if (!existing) return [null, "Práctica externa no encontrada o sin permiso"];

    const updated = await internshipExternalRepository.save({
      ...existing,
      title: data.title ?? existing.title,
      description: data.description ?? existing.description,
      companyName: data.companyName ?? existing.companyName,
      companyAddress: data.companyAddress ?? existing.companyAddress,
      companyIndustry: data.companyIndustry ?? existing.companyIndustry,
      companyWebsite: data.companyWebsite ?? existing.companyWebsite,
      companyPhone: data.companyPhone ?? existing.companyPhone,
      companyEmail: data.companyEmail ?? existing.companyEmail,
      supervisorName: data.supervisorName ?? existing.supervisorName,
      supervisorPosition: data.supervisorPosition ?? existing.supervisorPosition,
      supervisorEmail: data.supervisorEmail ?? existing.supervisorEmail,
      supervisorPhone: data.supervisorPhone ?? existing.supervisorPhone,
      department: data.department ?? existing.department,
      activities: data.activities ?? existing.activities,
      estimatedDuration: data.estimatedDuration ?? existing.estimatedDuration,
      schedule: data.schedule ?? existing.schedule,
      specialtyArea: data.specialtyArea ?? existing.specialtyArea,
    });

    return [updated, null];
  } catch (error) {
    return [null, error.message];
  }
}

export async function deleteInternshipExternal(internshipExternalId, studentId) {
  try {
    const existing = await internshipExternalRepository.findOne({ where: { id: internshipExternalId, studentId } });
    if (!existing) return [null, "Práctica externa no encontrada o sin permiso"];

    await internshipExternalRepository.remove(existing);
    return [{ message: "Práctica externa eliminada" }, null];
  } catch (error) {
    return [null, error.message];
  }
}
