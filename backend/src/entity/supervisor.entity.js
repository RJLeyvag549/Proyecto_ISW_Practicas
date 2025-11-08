"use strict";
import { EntitySchema } from "typeorm";

const SupervisorEntity = new EntitySchema({
  name: "Supervisor",
  tableName: "supervisors",

  columns: {
    id: { type: "int", primary: true, generated: true },
    fullName: { type: "varchar", length: 255, nullable: false },
    email: { type: "varchar", length: 255, nullable: false },
    phone: { type: "varchar", length: 50, nullable: true },
    specialtyArea: { type: "varchar", length: 255, nullable: true }
  },

  relations: {
    company: { type: "many-to-one", target: "Company", joinColumn: true, nullable: false, onDelete: "CASCADE"},
    internships: { type: "one-to-many", target: "Internship", inverseSide: "supervisor" }
  }
});

export default SupervisorEntity;
