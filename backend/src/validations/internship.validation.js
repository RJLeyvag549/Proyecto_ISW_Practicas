import Joi from "joi";

export const createInternshipSchema = Joi.object({
  title: Joi.string().max(100).required(),
  description: Joi.string().required(),
  totalSlots: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .required()
    .messages({
      "number.base": "El número de cupos totales debe ser un número.",
      "number.integer": "El número de cupos totales debe ser un número entero.",
      "number.min": "El número de cupos totales debe ser al menos 1."
    }),
  specialtyArea: Joi.string().max(80).allow(null, ""),
  applicationDeadline: Joi.date()
    .required()
    .messages({
      "any.required": "La fecha límite de postulación es obligatoria.",
      "date.base": "La fecha límite debe ser una fecha válida (YYYY-MM-DD)."
    })
})
  .unknown(false)
  .messages({
    "object.unknown": "No se permiten propiedades adicionales."
  });

export const updateInternshipSchema = Joi.object({
  title: Joi.string().max(100),
  description: Joi.string(),
  totalSlots: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .messages({
      "number.base": "El número de cupos totales debe ser un número.",
      "number.integer": "El número de cupos totales debe ser un número entero.",
      "number.min": "El número de cupos totales debe ser al menos 1."
    }),
  specialtyArea: Joi.string().max(80).allow(null, ""),
  applicationDeadline: Joi.date()
    .required()
    .messages({
      "any.required": "La fecha límite de postulación es obligatoria al actualizar.",
      "date.base": "La fecha límite debe ser una fecha válida (YYYY-MM-DD)."
    })
})
  .unknown(false)
  .messages({
    "object.unknown": "No se permiten propiedades adicionales."
  });
