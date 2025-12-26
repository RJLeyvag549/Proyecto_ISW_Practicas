"use strict";
import { EntitySchema } from "typeorm";

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
    applicationType: {
      type: "varchar",
      length: 10,
      nullable: false,
    },
    internshipId: {
      type: "int",
      nullable: true,
    },
    internshipExternalId: {
      type: "int",
      nullable: true,
    },
    status: {
      type: "varchar",
      length: 20,
      nullable: false,
      default: "pending",
    },
    coordinatorComments: {
      type: "text",
      nullable: true,
    },
    attachments: {
      type: "text",
      nullable: true,
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
    //cerrar practica
    isClosed: {
      type: "boolean",
      default: false,
    },
    finalAverage: {
      type: "decimal",
      precision: 3,
      scale: 1,
      nullable: true,
    },
    finalResult: {
      type: "varchar",
      length: 20,
      nullable: true, //aproved - failed
    },
    closedAt: {
      type: "timestamp with time zone",
      nullable: true,
    },
  },
  relations: {
    student: {
      type: "many-to-one",
      target: "User",
      joinColumn: {
        name: "studentId",
      },
      nullable: false,
      onDelete: "CASCADE",
    },
    documents: {
      type: "one-to-many",
      target: "Document",
      inverseSide: "practiceApplication",
    },
    internship: {
      type: "many-to-one",
      target: "Internship",
      joinColumn: {
        name: "internshipId",
      },
      nullable: true,
    },
    internshipExternal: {
      type: "many-to-one",
      target: "InternshipExternal",
      joinColumn: {
        name: "internshipExternalId",
      },
      nullable: true,
    },
  },
  indices: [
    {
      name: "IDX_PRACTICE_APPLICATION",
      columns: ["id"],
      unique: true,
    },
    {
      name: "IDX_PRACTICE_APPLICATION_TYPE",
      columns: ["applicationType"],
    },
    {
      name: "IDX_PRACTICE_APPLICATION_STUDENT",
      columns: ["studentId"],
    },
    {
      name: "IDX_PRACTICE_APPLICATION_STATUS",
      columns: ["status"],
    },
  ],
});

export default PracticeApplicationSchema;
