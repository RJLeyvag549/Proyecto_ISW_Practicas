"use strict";
import { Router } from "express";
import userRoutes from "./user.routes.js";
import authRoutes from "./auth.routes.js";
import studentRoutes from "./student.routes.js";
import companyRoutes from "./company.routes.js";
import supervisorRoutes from "./supervisor.routes.js";
import internshipRoutes from "./internship.routes.js";
import practiceApplication from "./practiceApplication.routes.js";

const router = Router();

router
  .use("/auth", authRoutes)
  .use("/user", userRoutes)
  .use("/students", studentRoutes)
  .use("/companies", companyRoutes)
  .use("/companies", supervisorRoutes)
  .use("/internships", internshipRoutes)
  .use("/practiceApp", practiceApplication);

export default router;
