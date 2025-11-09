import Joi from "joi";
import { handleErrorClient, handleErrorServer } from "../handlers/responseHandlers.js";

export function validateBody(schema) {
  return (req, res, next) => {
    try {
      const { error } = schema.validate(req.body, { abortEarly: false });
      if (error) {
        const details = error.details.map(d => d.message);
        return handleErrorClient(res, 400, "Datos inválidos", details);
      }
      next();
    } catch (error) {
      handleErrorServer(res, 500, error.message);
    }
  };
}
