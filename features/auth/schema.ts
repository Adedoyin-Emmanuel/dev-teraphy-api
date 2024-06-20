import Joi from "joi";

export const terpahistSignupSchema = Joi.object({
  email: Joi.string().email().required(),
  name: Joi.string().required().max(20),
  password: Joi.string().required().min(6).max(20),
});

export const teraphistLoginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required().min(6).max(20),
});

export const updateLoginSchema = Joi.object({
  email: Joi.string().email().required(),
  name: Joi.string().required(),
  role: Joi.string().default("user"),
  googleId: Joi.string().required(),
});


export const verifyOtpSchema = Joi.object({
    terahpistId: Joi.string().required(),
    otp: Joi.string().required(),
})