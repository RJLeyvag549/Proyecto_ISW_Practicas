import Joi from "joi";

export const createInternshipSchema = Joi.object({
  title: Joi.string().max(100).required(),
  description: Joi.string().required(),
  availableSlots: Joi.number().integer().min(1).default(1),
  specialtyArea: Joi.string().max(80).allow(null, "")
});

export const updateInternshipSchema = Joi.object({
  title: Joi.string().max(100),
  description: Joi.string(),
  availableSlots: Joi.number().integer().min(1),
  specialtyArea: Joi.string().max(80).allow(null, "")
});
