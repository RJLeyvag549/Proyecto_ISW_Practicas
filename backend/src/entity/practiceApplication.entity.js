"use strict";
import { EntitySchema } from "typeorm";

/**
 * Entidad PracticeApplication
 */
const PracticeApplicationSchema = new EntitySchema({
  name: "PracticeApplication",
  tableName: "practiceApplications",
  columns: {
    id: {
      type: "int",
      primary: true,
      generated: true,
    },
    studentId: {
      type: "int",
      nullable: false,
    },
    internshipId: {
      type: "int",
      nullable: false,
    },
    status: {
      type: "varchar",
      length: 20,
      nullable: false,
      default: "pending", // Valores permitidos: pending, accepted, rejected, needsInfo
    },
    coordinatorComments: {
      type: "text",
      nullable: true, // Obligatorio si status = rejected o needsInfo
    },
    attachments: {
      type: "text",
      nullable: true, // Puede usarse para guardar nombres/urls de documentos
    },
    createdAt: {
      type: "timestamp with time zone",
      default: () => "CURRENT_TIMESTAMP",
      nullable: false,
    },
    updatedAt: {
      type: "timestamp with time zone",
      default: () => "CURRENT_TIMESTAMP",
      onUpdate: "CURRENT_TIMESTAMP",
      nullable: false,
    },
  },
  //relaciones studentId e internshipId
    relations: {
    student: {
      type: "many-to-one",
      target: "User",
      joinColumn: { name: "studentId" },
      nullable: false,
      onDelete: "CASCADE",
    },
    internship: {
      type: "many-to-one",
      target: "Internship",
      joinColumn: { name: "internshipId" },
      nullable: false,
      onDelete: "CASCADE",
    },
    },
  indices: [
    {
      name: "IDX_PRACTICE_APPLICATION",
      columns: ["id"],
      unique: true,
    },
  ],
});

export default PracticeApplicationSchema;
