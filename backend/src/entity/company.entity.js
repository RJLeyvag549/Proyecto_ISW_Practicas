"use strict";
import { EntitySchema } from "typeorm";

const CompanyEntity = new EntitySchema({
  name: "Company",
  tableName: "companies",

  columns: {
    id: { type: "int", primary: true, generated: true },
    name: { type: "varchar", length: 80, nullable: false , unique: true},
    industry: { type: "varchar", length: 200, nullable: false },
    address: { type: "varchar", length: 100, nullable: false },
    contactEmail: { type: "varchar", length: 70, nullable: false },
    contactPhone: { type: "varchar", length: 50, nullable: true },
    websiteUrl: { type: "varchar", length: 500, nullable: true },
    createdAt: { type: "timestamp with time zone", default: () => "CURRENT_TIMESTAMP" },
    updatedAt: { type: "timestamp with time zone", default: () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP" }
  },

  relations: {
    supervisors: { type: "one-to-many", target: "Supervisor", inverseSide: "company" },
    internships: { type: "one-to-many", target: "Internship", inverseSide: "company" }
  }
});

export default CompanyEntity;
