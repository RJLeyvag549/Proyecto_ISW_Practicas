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
      requirements: data.requirements || null,
      specialtyArea: data.specialtyArea || null,
    });

    return [newInternshipExternal, null];
  } catch (error) {
    return [null, error.message];
  }
}
