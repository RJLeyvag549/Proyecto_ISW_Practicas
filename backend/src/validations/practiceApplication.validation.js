"use strict";
import Joi from "joi";
import { internshipExternalValidation } from "./internshipExternal.validation.js";

export const practiceApplicationValidation = Joi.object({
  applicationType: Joi.string()
    .valid("existing", "external")
    .required()
    .messages({
      "any.required": "El tipo de aplicación es obligatorio.",
      "any.only": "El tipo de aplicación debe ser 'existing' o 'external'."
    }),
  
  internshipId: Joi.number()
    .integer()
    .positive()
    .when("applicationType", {
      is: "existing",
      then: Joi.required(),
      otherwise: Joi.forbidden()
    })
    .messages({
      "any.required": "El campo internshipId es obligatorio para aplicaciones a ofertas existentes.",
      "number.base": "El campo internshipId debe ser un número.",
      "number.integer": "El campo internshipId debe ser un número entero.",
      "number.positive": "El campo internshipId debe ser positivo.",
      "any.unknown": "internshipId no está permitido para aplicaciones externas."
    }),

  companyData: internshipExternalValidation
    .when("applicationType", {
      is: "external",
      then: Joi.required(),
      otherwise: Joi.forbidden()
    })
    .messages({
      "any.required": "Los datos de la empresa son obligatorios para aplicaciones externas.",
      "any.unknown": "Los datos de empresa no están permitidos para aplicaciones a ofertas existentes."
    }),
}).unknown(false).messages({
  "object.unknown": "No se permiten propiedades adicionales."
});

export const statusUpdateValidation = Joi.object({
  status: Joi.string()
    .valid("accepted", "rejected", "needsInfo")
    .required()
    .messages({
      "any.required": "El campo status es obligatorio.",
      "any.only": "El estado debe ser uno de: accepted, rejected, needsInfo."
    }),

  // Permite confirmar explícitamente una segunda aprobación para el mismo estudiante.
  // Solo se usa cuando el backend devuelve una advertencia y el encargado confirma.
  force: Joi.boolean().optional(),

  coordinatorComments: Joi.string()
    .max(1000)
    .when("status", {
      is: Joi.valid("rejected", "needsInfo"),
      then: Joi.required()
        .messages({
          "any.required": "Debes ingresar comentarios"
        }),
      otherwise: Joi.optional()
    })
    .messages({
      "string.max": "Los comentarios no pueden superar los 1000 caracteres."
    })
}).unknown(false).messages({
  "object.unknown": "No se permiten propiedades adicionales."
});

export const practiceApplicationUpdateValidation = Joi.object({
  companyData: internshipExternalValidation.optional(),
}).unknown(false).messages({
  "object.unknown": "No se permiten propiedades adicionales."
});

export const closeApplicationValidation = Joi.object({
  minAverage: Joi.number().min(1.0).max(7.0).optional(),
}).unknown(false).messages({
  "object.unknown": "No se permiten propiedades adicionales."
});