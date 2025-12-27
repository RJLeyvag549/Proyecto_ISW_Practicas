"use strict";
import { EntitySchema } from "typeorm";


const DocumentSchema = new EntitySchema({
  name: "Document",
  tableName: "documents",
  columns: {
    id: {
      type: "int",
      primary: true,
      generated: true,
    },
    practiceApplicationId: {
      type: "int",
      nullable: true,
    },
    internshipExternalId: {
      type: "int",
      nullable: true,
    },
    type: {
      type: "varchar",
      length: 50,
      nullable: false,

    },
    filename: {
      type: "varchar",
      length: 255,
      nullable: false,
    },
    filepath: {
      type: "varchar",
      length: 500,
      nullable: false,
    },
    uploadedBy: {
      type: "int",
      nullable: false, 
    },
    period: {
      type: "varchar",
      length: 50,
      nullable: true,
    },
    status: {
      type: "varchar",
      length: 20,
      default: "pending",
      nullable: false,
    },
    comments: {
      type: "text",
      nullable: true,
    },
    grade: {
      type: "decimal",
      precision: 5,
      scale: 2,
      nullable: true,
    },
    weight: {
      type: "decimal",
      precision: 5,
      scale: 2,
      default: 0,
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
    practiceApplication: {
      type: "many-to-one",
      target: "PracticeApplication",
      joinColumn: { name: "practiceApplicationId" },
      nullable: true,
      onDelete: "CASCADE",
    },
    internshipExternal: {
      type: "many-to-one",
      target: "InternshipExternal",
      joinColumn: { name: "internshipExternalId" },
      nullable: true,
      onDelete: "CASCADE",
    },
    uploader: {
      type: "many-to-one",
      target: "User",
      joinColumn: { name: "uploadedBy" },
      nullable: false,
    },
  },// 
  indices: [
    {
      name: "IDX_DOCUMENT_PRIMARY",
      columns: ["id"],
      unique: true,
    },
    {
      name: "IDX_DOCUMENT_APPLICATION",
      columns: ["practiceApplicationId"],
    },
    {
      name: "IDX_DOCUMENT_INTERNSHIP_EXTERNAL",
      columns: ["internshipExternalId"],
    },
  ],
});

export default DocumentSchema;