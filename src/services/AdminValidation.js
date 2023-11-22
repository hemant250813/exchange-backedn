const Response = require("./Response");
const Joi = require("@hapi/joi");
const Helper = require("./Helper");
const Constants = require("../services/Constants");

module.exports = {
  /**
  * @description This function is used to validate User Login fields.
  * @param req
  * @param res
  */
  loginValidation: (req, res, callback) => {
    const schema = Joi.object({
      username: Joi.string().trim().optional(),
      mobile_no: Joi.string()
        .trim()
        .max(15)
        .required()
        .optional(),
      email: Joi.string()
        .pattern(/^([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+)\.([a-zA-Z]{2,})$/)
        .optional(),
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
        res.__(Helper.validationMessageKey("loginValidation", error))
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
  }
};
