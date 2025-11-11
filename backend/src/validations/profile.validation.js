"use strict";
import Joi from "joi";

export const profileValidation = Joi.object({
  bio: Joi.string()
    .max(500)
    .optional()
    .messages({
      "string.max": "La biografía no puede superar los 500 caracteres."
    }),

  career: Joi.string()
    .max(100)
    .optional()
    .messages({
      "string.max": "La carrera no puede superar los 100 caracteres."
    }),

  semester: Joi.number()
    .integer()
    .min(1)
    .max(12)
    .optional()
    .messages({
      "number.base": "El semestre debe ser un número.",
      "number.integer": "El semestre debe ser un número entero.",
      "number.min": "El semestre debe ser mayor a 0.",
      "number.max": "El semestre no puede ser mayor a 12."
    }),

  gpa: Joi.number()
    .min(1.0)
    .max(7.0)
    .precision(2)
    .optional()
    .messages({
      "number.base": "El promedio debe ser un número.",
      "number.min": "El promedio debe ser mayor a 1.0.",
      "number.max": "El promedio no puede ser mayor a 7.0."
    }),

  availableSchedule: Joi.string()
    .max(500)
    .optional()
    .messages({
      "string.max": "La disponibilidad horaria no puede superar los 500 caracteres."
    }),

  areasOfInterest: Joi.string()
    .max(500)
    .optional()
    .messages({
      "string.max": "Las áreas de interés no pueden superar los 500 caracteres."
    }),

  previousKnowledge: Joi.string()
    .max(1000)
    .optional()
    .messages({
      "string.max": "Los conocimientos previos no pueden superar los 1000 caracteres."
    }),

  additionalComments: Joi.string()
    .max(500)
    .optional()
    .messages({
      "string.max": "Los comentarios adicionales no pueden superar los 500 caracteres."
    }),
}).unknown(false).messages({
  "object.unknown": "No se permiten propiedades adicionales."
});

export const documentsValidation = Joi.object({
  curriculum: Joi.string()
    .max(255)
    .optional()
    .messages({
      "string.max": "El nombre del currículum no puede superar los 255 caracteres."
    }),

  coverLetter: Joi.string()
    .max(255)
    .optional()
    .messages({
      "string.max": "El nombre de la carta de presentación no puede superar los 255 caracteres."
    }),
}).min(1).unknown(false).messages({
  "object.min": "Debe proporcionar al menos un documento.",
  "object.unknown": "No se permiten propiedades adicionales."
});
