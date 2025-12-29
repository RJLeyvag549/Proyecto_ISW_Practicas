import Joi from "joi";

export const createSupervisorSchema = Joi.object({
  fullName: Joi.string().max(100).required(),
  email: Joi.string().email({ minDomainSegments: 2 }).max(70).required(),
  phone: Joi.string()
    .pattern(/^[+]?[\d\s\-()]{7,15}$/)
    .max(40)
    .allow(null, "")
    .messages({
      "string.pattern.base": "El formato del teléfono no es válido (ej: +56 9 1234 5678)"
    }),
  specialtyArea: Joi.string().max(80).allow(null, "")
})
  .unknown(false)
  .messages({
    "object.unknown": "No se permiten propiedades adicionales."
  });

export const updateSupervisorSchema = Joi.object({
  fullName: Joi.string().max(100),
  email: Joi.string().email({ minDomainSegments: 2 }).max(70),
  phone: Joi.string()
    .pattern(/^[+]?[\d\s\-()]{7,15}$/)
    .max(40)
    .allow(null, "")
    .messages({
      "string.pattern.base": "El formato del teléfono no es válido (ej: +56 9 1234 5678)"
    }),
  specialtyArea: Joi.string().max(80).allow(null, "")
})
  .unknown(false)
  .messages({
    "object.unknown": "No se permiten propiedades adicionales."
  });