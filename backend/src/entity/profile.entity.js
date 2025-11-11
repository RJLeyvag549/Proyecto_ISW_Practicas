"use strict";
import { EntitySchema } from "typeorm";

const ProfileSchema = new EntitySchema({
  name: "Profile",
  tableName: "profiles",
  columns: {
    id: {
      type: "int",
      primary: true,
      generated: true,
    },
    userId: {
      type: "int",
      nullable: false,
    },
    bio: {
      type: "text",
      nullable: true,
    },
    career: {
      type: "varchar",
      length: 100,
      nullable: true,
    },
    semester: {
      type: "int",
      nullable: true,
    },
    gpa: {
      type: "decimal",
      precision: 4,
      scale: 2,
      nullable: true,
    },
    curriculum: {
      type: "varchar",
      length: 255,
      nullable: true,
    },
    coverLetter: {
      type: "varchar",
      length: 255,
      nullable: true,
    },
    availableSchedule: {
      type: "text",
      nullable: true,
    },
    areasOfInterest: {
      type: "text",
      nullable: true,
    },
    previousKnowledge: {
      type: "text",
      nullable: true,
    },
    additionalComments: {
      type: "text",
      nullable: true,
    },
    profileCompleted: {
      type: "boolean",
      default: false,
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
    user: {
      type: "one-to-one",
      target: "User",
      joinColumn: {
        name: "userId",
      },
      onDelete: "CASCADE",
    },
  },
});

export default ProfileSchema;