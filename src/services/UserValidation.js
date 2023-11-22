const Response = require("./Response");
const Joi = require("@hapi/joi");
const Helper = require("./Helper");
const {
  USER_TYPE,
  MEDIA_TYPE,
  POST_DEFAULT_VISIBILITY,
  ALLOW_MESSAGE_FROM,
  LAST_SEEN,
  LIKED_TYPE,
} = require("../services/Constants");
module.exports = {
  /**
   * @description This function is used to validate user registration fields.
   * @param req
   * @param res
   */
  userRegisterValidation: (req, res, callback) => {
    const schema = Joi.object({
      email: Joi.string().email().trim().optional(),
      mobile_no: Joi.string().trim().max(15).optional(),
      password: Joi.string()
        .trim()
        .min(8)
        .regex(/^(?=.*[0-9])(?=.*[a-zA-Z])[a-zA-Z0-9!@#$%^&*]{6,}$/)
        .required(), //.regex(/^(?=.*[0-9])(?=.*[a-zA-Z])[a-zA-Z0-9!@#$%^&*]{6,}$/),
    });
    const { error } = schema.validate(req);
    if (error) {
      return Response.validationErrorResponseData(
        res,
        res.__(Helper.validationMessageKey("userRegisterValidation", error))
      );
    }
    return callback(true);
  },

  /**
   * @description This function is used to validate user otp verification fields.
   * @param req
   * @param res
   */
  verifyOtpValidation: (req, res, callback) => {
    const schema = Joi.object({
      mobile_no: Joi.string().trim().max(15).optional(),
      otp: Joi.string().trim().required(),
    });
    const { error } = schema.validate(req);
    if (error) {
      return Response.validationErrorResponseData(
        res,
        res.__(Helper.validationMessageKey("verifyOtpValidation", error))
      );
    }
    return callback(true);
  },

  /**
   * @description This function is used to validate user otp verification fields.
   * @param req
   * @param res
   */
  resendOtpValidation: (req, res, callback) => {
    const schema = Joi.object({
      mobile_no: Joi.string().trim().max(15).optional(),
      email: Joi.string()
        .trim()
        .pattern(/^([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+)\.([a-zA-Z]{2,})$/)
        .optional(),
    });
    const { error } = schema.validate(req);
    if (error) {
      return Response.validationErrorResponseData(
        res,
        res.__(Helper.validationMessageKey("resendOtpValidation", error))
      );
    }
    return callback(true);
  },

  /**
   * @description This function is used to validate User Login fields.
   * @param req
   * @param res
   */
  loginValidation: (req, res, callback) => {
    const schema = Joi.object({
      username: Joi.string().trim().optional(),
      user: Joi.string().trim().required().optional(),
      email: Joi.string().optional(),
      password: Joi.string().trim().min(8).required(),
    });
    const { error } = schema.validate(req);
    if (error) {
      return Response.validationErrorResponseData(
        res,
        res.__(Helper.validationMessageKey("loginValidation", error))
      );
    }
    return callback(true);
  },

  /**
   * @description This function is used to validate forget password fields.
   * @param req
   * @param res
   */
  forgotPasswordValidation: (req, res, callback) => {
    const schema = Joi.object({
      mobile_no: Joi.string().trim().max(15).required().optional(),
      email: Joi.string()
        .trim()
        .pattern(/^([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+)\.([a-zA-Z]{2,})$/)
        .optional(),
    });
    const { error } = schema.validate(req);
    if (error) {
      return Response.validationErrorResponseData(
        res,
        res.__(Helper.validationMessageKey("forgotPasswordValidation", error))
      );
    }
    return callback(true);
  },

  /**
   * @description This function is used to validate user otp verification fields.
   * @param req
   * @param res
   */
  resetPasswordValidation: (req, res, callback) => {
    const schema = Joi.object({
      otp: Joi.string().trim().required(),
      password: Joi.string()
        .trim()
        .min(8)
        .regex(/^(?=.*[0-9])(?=.*[a-zA-Z])[a-zA-Z0-9!@#$%^&*]{6,}$/)
        .required(), //.regex(/^(?=.*[0-9])(?=.*[a-zA-Z])[a-zA-Z0-9!@#$%^&*]{6,}$/),
    });
    const { error } = schema.validate(req);
    if (error) {
      return Response.validationErrorResponseData(
        res,
        res.__(Helper.validationMessageKey("resetPasswordValidation", error))
      );
    }
    return callback(true);
  },

  /**
   * @description This function is used to validate change password fields.
   * @param req
   * @param res
   */
  changePasswordValidation: (req, res, callback) => {
    const schema = Joi.object({
      old_password: Joi.string()
        .trim()
        .min(8)
        .regex(/^(?=.*[0-9])(?=.*[a-zA-Z])[a-zA-Z0-9!@#$%^&*]{6,}$/)
        .required(),
      password: Joi.string()
        .trim()
        .min(8)
        .regex(/^(?=.*[0-9])(?=.*[a-zA-Z])[a-zA-Z0-9!@#$%^&*]{6,}$/)
        .required(),
    });
    const { error } = schema.validate(req);
    if (error) {
      return Response.validationErrorResponseData(
        res,
        res.__(Helper.validationMessageKey("changePasswordValidation", error))
      );
    }
    return callback(true);
  },
};
