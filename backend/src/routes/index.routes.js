"use strict";
import { Router } from "express";
import userRoutes from "./user.routes.js";
import authRoutes from "./auth.routes.js";
import studentRoutes from "./student.routes.js";

const router = Router();

router
  .use("/auth", authRoutes)
  .use("/user", userRoutes)
  .use("/students", studentRoutes);

export default router;