import Joi from "joi";

export const createCompanySchema = Joi.object({
  name: Joi.string().max(80).required(),
  industry: Joi.string().max(200).required(),
  address: Joi.string().max(100).required(),
  contactEmail: Joi.string().email().max(70).required(),
  contactPhone: Joi.string().max(50).allow(null, ""),
  websiteUrl: Joi.string().uri().max(500).allow(null, "")
});

export const updateCompanySchema = Joi.object({
  name: Joi.string().max(80),
  industry: Joi.string().max(200),
  address: Joi.string().max(100),
  contactEmail: Joi.string().email().max(70),
  contactPhone: Joi.string().max(50).allow(null, ""),
  websiteUrl: Joi.string().uri().max(500).allow(null, "")
});
