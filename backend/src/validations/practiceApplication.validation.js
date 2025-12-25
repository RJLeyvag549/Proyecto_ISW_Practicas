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

  attachments: Joi.array()
    .items(Joi.string().max(255))
    .max(5)
    .optional()
    .messages({
      "array.max": "No puedes adjuntar más de 5 documentos.",
      "string.max": "El nombre del documento no puede superar los 255 caracteres."
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

export const attachmentsValidation = Joi.object({
  attachments: Joi.array()
    .items(Joi.string().max(255))
    .max(5)
    .required()
    .messages({
      "array.max": "No puedes adjuntar mas de 5 documentos.",
      "string.max": "El nombre del documento no puede superar los 255 caracteres.",
      "any.required": "Debes adjuntar al menos un documento."
    })
}).unknown(false).messages({
  "object.unknown": "No se permiten propiedades adicionales."
});

export const closeApplicationValidation = Joi.object({
  minAverage: Joi.number().min(1.0).max(7.0).optional(),
}).unknown(false).messages({
  "object.unknown": "No se permiten propiedades adicionales."
});
