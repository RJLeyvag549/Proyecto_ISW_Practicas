"use strict";
import Joi from "joi";

export const createDocumentSchema = Joi.object({
  practiceApplicationId: Joi.number().required(),
  type: Joi.string().valid("PROGRESS_REPORT", "FINAL_REPORT", "PERFORMANCE_EVALUATION").required(),
  period: Joi.string().when("type", {
    is: "PROGRESS_REPORT",
    then: Joi.required(),
    otherwise: Joi.optional()
  }),
  comments: Joi.string().optional(),
});

export const updateDocumentSchema = Joi.object({
  status: Joi.string().valid("pending", "approved", "rejected").required(),
  comments: Joi.string().optional(),
});