"use strict";
import Joi from "joi";

export const studentRegisterValidation = Joi.object({
  nombreCompleto: Joi.string().required().messages({
    "string.empty": "El nombre completo es requerido",
    "any.required": "El nombre completo es requerido",
  }),
  rut: Joi.string()
    .pattern(/^[0-9]{7,8}-[0-9kK]{1}$/)
    .required()
    .messages({
      "string.pattern.base": "El formato del RUT no es válido",
      "string.empty": "El RUT es requerido",
      "any.required": "El RUT es requerido",
    }),
  email: Joi.string()
    .email()
    .pattern(/@gmail\.cl$/)
    .required()
    .messages({
      "string.email": "El formato del correo no es válido",
      "string.pattern.base": "Debe ser un correo @gmail.cl",
      "string.empty": "El correo es requerido",
      "any.required": "El correo es requerido",
    }),
  password: Joi.string()
    .min(8)
    .max(26)
    .required()
    .messages({
      "string.min": "La contraseña debe tener al menos 8 caracteres.",
      "string.max": "La contraseña debe tener como máximo 26 caracteres.",
      "string.empty": "La contraseña es requerida.",
      "any.required": "La contraseña es requerida."
    }),
});

export const approvalValidation = Joi.object({
  approved: Joi.boolean().required(),
  rejectionReason: Joi.when("approved", {
    is: false,
    then: Joi.string().required(),
    otherwise: Joi.string().allow(null, ""),
  }),
});