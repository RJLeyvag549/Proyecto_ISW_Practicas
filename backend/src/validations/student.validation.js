"use strict";
import Joi from "joi";

export const studentRegisterValidation = Joi.object({
  nombreCompleto: Joi.string().required().messages({
    "string.empty": "El nombre completo es requerido",
    "any.required": "El nombre completo es requerido",
  }),
  rut: Joi.string()
    .pattern(/^(\d{1,2}\.\d{3}\.\d{3}|\d{7,8})-[\dkK]$/)
    .required()
    .messages({
      "string.pattern.base": "El formato del RUT no es válido (Ej: 12.345.678-9 o 12345678-9)",
      "string.empty": "El RUT es requerido",
      "any.required": "El RUT es requerido",
    }),
  email: Joi.string()
    .email()
    .required()
    .messages({
      "string.email": "El formato del correo no es válido",
      "string.empty": "El correo es requerido",
      "any.required": "El correo es requerido",
    }),
  password: Joi.string().min(6).required().messages({
    "string.min": "La contraseña debe tener al menos 6 caracteres",
    "string.empty": "La contraseña es requerida",
    "any.required": "La contraseña es requerida",
  }),
  carrera: Joi.string().required().messages({
    "string.empty": "La carrera es requerida",
    "any.required": "La carrera es requerida",
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