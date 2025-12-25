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
      nullable: false,
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
      precision: 3,
      scale: 1,
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
  },
  relations: {
    practiceApplication: {
      type: "many-to-one",
      target: "PracticeApplication",
      joinColumn: { name: "practiceApplicationId" },
      nullable: false,
      onDelete: "CASCADE",
    },
    uploader: {
      type: "many-to-one",
      target: "User",
      joinColumn: { name: "uploadedBy" },
      nullable: false,
    },
  },
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
  ],
});

export default DocumentSchema;