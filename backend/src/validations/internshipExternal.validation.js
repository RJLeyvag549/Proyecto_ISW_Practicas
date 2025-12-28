"use strict";
import Joi from "joi";

export const internshipExternalValidation = Joi.object({

  title: Joi.string()
    .min(5)
    .max(200)
    .required()
    .messages({
      "any.required": "El título de la práctica es obligatorio.",
      "string.min": "El título debe tener al menos 5 caracteres.",
      "string.max": "El título no puede superar los 200 caracteres."
    }),
    
  description: Joi.string()
    .min(20)
    .max(2000)
    .required()
    .messages({
      "any.required": "La descripción de la práctica es obligatoria.",
      "string.min": "La descripción debe tener al menos 20 caracteres.",
      "string.max": "La descripción no puede superar los 2000 caracteres."
    }),

  companyName: Joi.string()
    .min(2)
    .max(255)
    .required()
    .messages({
      "any.required": "El nombre de la empresa es obligatorio.",
      "string.min": "El nombre de la empresa debe tener al menos 2 caracteres.",
      "string.max": "El nombre de la empresa no puede superar los 255 caracteres."
    }),

  companyAddress: Joi.string()
    .min(10)
    .max(500)
    .required()
    .messages({
      "any.required": "La dirección de la empresa es obligatoria.",
      "string.min": "La dirección debe tener al menos 10 caracteres.",
      "string.max": "La dirección no puede superar los 500 caracteres."
    }),

  companyIndustry: Joi.string()
    .allow("")
    .min(3)
    .max(100)
    .optional()
    .messages({
      "string.min": "La industria debe tener al menos 3 caracteres.",
      "string.max": "La industria no puede superar los 100 caracteres."
    }),

  companyWebsite: Joi.string()
    .allow("")
    .uri()
    .max(255)
    .optional()
    .messages({
      "string.uri": "El sitio web debe ser una URL válida.",
      "string.max": "El sitio web no puede superar los 255 caracteres."
    }),

  companyPhone: Joi.string()
    .allow("")
    .pattern(/^[+]?[\d\s\-()]{7,25}$/)
    .optional()
    .messages({
      "string.pattern.base": "El teléfono de la empresa debe tener un formato válido (ej: +56 9 1234 5678)."
    }),

  companyEmail: Joi.string()
    .allow("")
    .email()
    .max(255)
    .optional()
    .messages({
      "string.email": "El email de la empresa debe tener un formato válido.",
      "string.max": "El email no puede superar los 255 caracteres."
    }),

  supervisorName: Joi.string()
    .min(3)
    .max(255)
    .required()
    .messages({
      "any.required": "El nombre del supervisor es obligatorio.",
      "string.min": "El nombre del supervisor debe tener al menos 3 caracteres.",
      "string.max": "El nombre del supervisor no puede superar los 255 caracteres."
    }),

  supervisorPosition: Joi.string()
    .min(3)
    .max(100)
    .required()
    .messages({
      "any.required": "El cargo del supervisor es obligatorio.",
      "string.min": "El cargo debe tener al menos 3 caracteres.",
      "string.max": "El cargo no puede superar los 100 caracteres."
    }),

  supervisorEmail: Joi.string()
    .email()
    .max(255)
    .required()
    .messages({
      "any.required": "El email del supervisor es obligatorio.",
      "string.email": "El email del supervisor debe tener un formato válido.",
      "string.max": "El email no puede superar los 255 caracteres."
    }),

  supervisorPhone: Joi.string()
    .allow("")
    .pattern(/^[+]?[\d\s\-()]{7,25}$/)
    .optional()
    .messages({
      "string.pattern.base": "El teléfono del supervisor debe tener un formato válido (ej: +56 9 1234 5678)."
    }),

  department: Joi.string()
    .allow("")
    .min(3)
    .max(100)
    .optional()
    .messages({
      "string.min": "El departamento debe tener al menos 3 caracteres.",
      "string.max": "El departamento no puede superar los 100 caracteres."
    }),

  activities: Joi.string()
    .min(20)
    .max(2000)
    .required()
    .messages({
      "any.required": "Las actividades a desarrollar son obligatorias.",
      "string.min": "Las actividades deben tener al menos 20 caracteres.",
      "string.max": "Las actividades no pueden superar los 2000 caracteres."
    }),

  estimatedDuration: Joi.string()
    .min(2)
    .max(50)
    .required()
    .messages({
      "any.required": "La duración estimada es obligatoria.",
      "string.min": "La duración debe tener al menos 2 caracteres.",
      "string.max": "La duración no puede superar los 50 caracteres."
    }),

  schedule: Joi.string()
    .allow("")
    .min(5)
    .max(1000)
    .optional()
    .messages({
      "string.min": "Los horarios deben tener al menos 5 caracteres.",
      "string.max": "Los horarios no pueden superar los 1000 caracteres."
    }),

  specialtyArea: Joi.string()
    .allow("")
    .min(3)
    .max(100)
    .optional()
    .messages({
      "string.min": "El área de especialidad debe tener al menos 3 caracteres.",
      "string.max": "El área de especialidad no puede superar los 100 caracteres."
    }),

}).unknown(false).messages({
  "object.unknown": "No se permiten propiedades adicionales."
});


export const statusUpdateValidation = Joi.object({
  status: Joi.string()
    .valid("approved", "rejected", "needsInfo")
    .required()
    .messages({
      "any.required": "El campo status es obligatorio.",
      "any.only": "El estado debe ser uno de: approved, rejected, needsInfo."
    }),

  coordinatorComments: Joi.string()
    .max(1000)
    .when("status", {
      is: Joi.valid("rejected", "needsInfo"),
      then: Joi.required()
        .messages({
          "any.required": "Debes ingresar comentarios para rechazar o solicitar más información"
        }),
      otherwise: Joi.optional()
    })
    .messages({
      "string.max": "Los comentarios no pueden superar los 1000 caracteres."
    })
}).unknown(false).messages({
  "object.unknown": "No se permiten propiedades adicionales."
});
