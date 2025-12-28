"use strict";
import Joi from "joi";

export const createDocumentSchema = Joi.object({
  practiceApplicationId: Joi.number().required(),
  type: Joi.string()
    .valid("PROGRESS_REPORT", "FINAL_REPORT", "PERFORMANCE_EVALUATION")
    .required(),
  period: Joi.string().when("type", {
    is: "PROGRESS_REPORT",
    then: Joi.required(),
    otherwise: Joi.optional()
  }),
  comments: Joi.string().optional(),
  uploadedBy: Joi.number().optional(),
});

export const updateDocumentSchema = Joi.object({
  status: Joi.string().valid("pending", "approved", "rejected").optional(),
  comments: Joi.string().optional().allow(""),
  grade: Joi.number().min(1.0).max(7.0).optional().allow(null),
  weight: Joi.number().min(0).max(100).optional().allow(null),
}).or("status", "comments", "grade", "weight");
