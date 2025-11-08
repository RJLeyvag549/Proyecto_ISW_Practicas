"use strict";
import Joi from "joi";

// Validacion para crear solicitud de practica
export const practiceApplicationValidation = Joi.object({
  offerId: 
  Joi.number()
  .integer()
  .positive()
  .required()
  .messages({
  "any.required": "El campo offerId es obligatorio.",
  "number.base": "El campo offerId debe ser un numero.",
  "number.integer": "El campo offerId debe ser un numero entero.",
  "number.positive": "El campo offerId debe ser positivo."
    }),
  attachments: 
  Joi.array()
  .items(
    Joi.string()
    .max(255))
    .max(5)
    .messages({
  "array.max": "No puedes adjuntar mas de 5 documentos.",
  "string.max": "El nombre del documento no puede superar los 255 caracteres."
    })
    .optional(),
}).unknown(false).messages({
  "object.unknown": "No se permiten propiedades adicionales."
});

// Validacion para actualizar estado y comentarios
export const statusUpdateValidation = Joi.object({
  status: 
  Joi.string()
  .valid("accepted", "rejected", "needsInfo")
  .required()
  .messages({
  "any.required": "El campo status es obligatorio.",
  "any.only": "El estado debe ser uno de: accepted, rejected, needsInfo."
    }),
  coordinatorComments: 
  Joi.string()
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

// Validacion para adjuntar documentos
export const attachmentsValidation = Joi.object({
  attachments: 
  Joi.array()
  .items(Joi.string()
         .max(255))
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
