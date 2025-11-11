"use strict";
import { EntitySchema } from "typeorm";

const InternshipEntity = new EntitySchema({
  name: "Internship",
  tableName: "internships",

  columns: {
    id: { type: "int", primary: true, generated: true },
    title: { type: "varchar", length: 100, nullable: false, unique: true },
    description: { type: "text", nullable: false },
    availableSlots: { type: "int", default: 1 },
    specialtyArea: { type: "varchar", length: 80, nullable: true },
    applicationDeadline: { type: "date", nullable: false },
    createdAt: { type: "timestamp with time zone", default: () => "CURRENT_TIMESTAMP" },
    updatedAt: { type: "timestamp with time zone", default: () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP" }
  },

  relations: {
    company: { type: "many-to-one", target: "Company", joinColumn: true, nullable: false },
    supervisor: { type: "many-to-one", target: "Supervisor", joinColumn: true, nullable: true }
  }
});

export default InternshipEntity;

