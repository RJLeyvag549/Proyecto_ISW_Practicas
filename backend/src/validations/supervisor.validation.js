import Joi from "joi";

export const createSupervisorSchema = Joi.object({
  fullName: Joi.string().max(100).required(),
  email: Joi.string().email().max(70).required(),
  phone: Joi.string().max(40).allow(null, ""),
  specialtyArea: Joi.string().max(80).allow(null, ""),
  companyId: Joi.number().integer().required()
})
.unknown(false)
.messages({
  "object.unknown": "No se permiten propiedades adicionales."
});

export const updateSupervisorSchema = Joi.object({
  fullName: Joi.string().max(100),
  email: Joi.string().email().max(70),
  phone: Joi.string().max(40).allow(null, ""),
  specialtyArea: Joi.string().max(80).allow(null, ""),
  companyId: Joi.number().integer()
})
.unknown(false)
.messages({
  "object.unknown": "No se permiten propiedades adicionales."
});