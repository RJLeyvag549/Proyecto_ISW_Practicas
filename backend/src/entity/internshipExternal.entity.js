"use strict";
import { EntitySchema } from "typeorm";

const InternshipExternalSchema = new EntitySchema({
  name: "InternshipExternal",
  tableName: "internshipExternal",
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
    title: {
      type: "varchar",
      length: 200,
      nullable: false,
    },
    description: {
      type: "text",
      nullable: false,
    },
    companyName: {
      type: "varchar",
      length: 255,
      nullable: false,
    },
    companyAddress: {
      type: "text",
      nullable: false,
    },
    companyIndustry: {
      type: "varchar",
      length: 100,
      nullable: true,
    },
    companyWebsite: {
      type: "varchar",
      length: 255,
      nullable: true,
    },
    companyPhone: {
      type: "varchar",
      length: 20,
      nullable: true,
    },
    companyEmail: {
      type: "varchar",
      length: 255,
      nullable: true,
    },
    supervisorName: {
      type: "varchar",
      length: 255,
      nullable: false,
    },
    supervisorPosition: {
      type: "varchar",
      length: 100,
      nullable: false,
    },
    supervisorEmail: {
      type: "varchar",
      length: 255,
      nullable: false,
    },
    supervisorPhone: {
      type: "varchar",
      length: 20,
      nullable: true,
    },
    department: {
      type: "varchar",
      length: 100,
      nullable: true,
    },
    activities: {
      type: "text",
      nullable: false,
    },
    estimatedDuration: {
      type: "varchar",
      length: 50,
      nullable: false,
    },
    schedule: {
      type: "text",
      nullable: false,
    },
    specialtyArea: {
      type: "varchar",
      length: 100,
      nullable: true,
    },
    isActive: {
      type: "boolean",
      default: true,
      nullable: false,
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
  relations: {
    student: {
      type: "many-to-one",
      target: "User",
      joinColumn: { name: "studentId" },
      nullable: false,
      onDelete: "CASCADE",
    },
  },
  indices: [
    {
      name: "IDX_INTERNSHIP_EXTERNAL",
      columns: ["id"],
      unique: true,
    },
    {
      name: "IDX_INTERNSHIP_EXTERNAL_STUDENT",
      columns: ["studentId"],
    },
    {
      name: "IDX_INTERNSHIP_EXTERNAL_COMPANY",
      columns: ["companyName"],
    },
  ],
});

export default InternshipExternalSchema;
