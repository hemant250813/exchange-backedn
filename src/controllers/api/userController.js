const bcrypt = require("bcrypt");
const moment = require("moment");
const Transformer = require("object-transformer");
const Response = require("../../services/Response");
const {
  ACTIVE,
  INACTIVE,
  INTERNAL_SERVER,
  SUCCESS,
  FAIL,
  MAIL_SUBJECT_FORGET_PASSWORD,
} = require("../../services/Constants");
const {
  generateRandomNumber,
  AppName,
  newRegistration,
} = require("../../services/Helper");
const Mailer = require("../../services/Mailer");
const { userRegisterValidation, verifyOtpValidation } = require("../../services/UserValidation");
const { User } = require("../../models");
const { sendMail } = require("../../services/Mailer");

module.exports = {
  /**
   * @description "This function is for User-Registration."
   * @param req
   * @param res
   */
  userRegistration: async (req, res) => {
    try {
      const requestParams = req.body;
      console.log("requestParams", requestParams);
      // Below function will validate all the fields which we were passing from the body.
      userRegisterValidation(requestParams, res, async (validate) => {
        if (validate) {
          let findQuery = {
            $or: [
              { email: { $eq: requestParams.email } },
              { mobile_no: { $eq: requestParams.mobile_no } },
            ],
          };

          let user = await User.findOne(findQuery, {
            mobile_no: 1,
            email: 1,
          });

          if (user?.email === requestParams.email) {
            return Response.successResponseWithoutData(
              res,
              res.__("emailAlreadyExist"),
              SUCCESS
            );
          } else if (user?.mobile_no === requestParams.mobile_no) {
            return Response.successResponseWithoutData(
              res,
              res.__("mobileAlreadyExist"),
              SUCCESS
            );
          } else {
            const CURRENT_DATE = new Date();
            const OTP_TOKEN_EXPIRE = new Date(
              CURRENT_DATE.getTime() + process.env.OTP_EXPIRY_MINUTE * 60000
            );
            const OTP = await generateRandomNumber(6);

            let userObj = {
              email: requestParams.email,
              mobile_no: requestParams.mobile_no,
              otp: OTP,
              verified: null,
              password: requestParams.password,
              passwordText: requestParams.password,
              otp_expiry: OTP_TOKEN_EXPIRE,
              status: INACTIVE,
            };

            const HASH_PASSWORD = await bcrypt.hash(requestParams.password, 10);
            userObj.password = HASH_PASSWORD;

            await User.create(userObj);

            const LOCALS = {
              appName: AppName,
              otp: OTP,
            };

            sendMail(
              requestParams.email,
              "new registration",
              newRegistration,
              LOCALS
            );

            let response = {
              email: requestParams.email,
              mobile_no: requestParams.mobile_no,
            };

            return Response.successResponseData(
              res,
              response,
              SUCCESS,
              res.__("resendOtpMobile")
            );
          }
        }
      });
    } catch (error) {
      return Response.errorResponseData(res, res.__("internalError"), error);
    }
  },

  /**
   * @description "This function is for verify mail."
   * @param req
   * @param res
   */
  verify: async (req, res) => {
    try {
      const requestParams = req.body;
      console.log("verify",requestParams);
      // Below function will validate all the fields which we are passing in the body.
      verifyOtpValidation(requestParams, res, async (validate) => {
        if (validate) {
          let findQuery = {
            $and: [
              { otp: { $eq: requestParams.otp } },
              { mobile_no: { $eq: requestParams.mobile_no } },
            ],
          };

          let user = await User.findOne(findQuery, { otp_expiry: 1 });

          if (user) {
            const CURRENT_TIME = new Date();
            const OTP_TOKEN_EXPIRE = new Date(user.otp_expiry);

            if (CURRENT_TIME.getTime() > OTP_TOKEN_EXPIRE.getTime()) {
              return Response.errorResponseWithoutData(
                res,
                res.locals.__("otpExpired"),
                FAIL
              );
            } else {
              const CURRENT_DATE_AND_TIME = moment().toDate();
              let query = {
                mobile_no: { $eq: requestParams.mobile_no },
              };

              await User.updateOne(query, {
                $set: {
                  verified: CURRENT_DATE_AND_TIME,
                  status: ACTIVE,
                  otp_expiry: null,
                },
              });

              return Response.successResponseWithoutData(
                res,
                res.__("verified"),
                SUCCESS
              );
            }
          } else {
            return Response.errorResponseWithoutData(
              res,
              res.locals.__("userNotExist"),
              FAIL
            );
          }
        }
      });
    } catch (error) {
      return Response.errorResponseData(res, res.__("internalError"), error);
    }
  },

  /**
   * @description "This function is for re-send OTP."
   * @param req
   * @param res
   */
  resendOtp: async (req, res) => {
    try {
      const requestParams = req.body;
      // Below function will validate all the fields which we are passing in the body.
      resendOtpValidation(requestParams, res, async (validate) => {
        if (validate) {
          let findQuery = {
            mobile_no: { $eq: requestParams.mobile_no },
          };

          let user = await User.findOne(findQuery, { username: 1 });

          if (user) {
            var CURRENT_DATE = new Date();
            const OTP_TOKEN_EXPIRE = new Date(
              CURRENT_DATE.getTime() + process.env.OTP_EXPIRY_MINUTE * 60000
            );
            const OTP = await generateRandomNumber(6);

            let query = {
              mobile_no: { $eq: requestParams.mobile_no },
            };

            await User.updateOne(query, {
              $set: {
                otp: OTP,
                otp_expiry: OTP_TOKEN_EXPIRE,
              },
            });

            const LOCALS = {
              username: user.username,
              appName: AppName,
              otp: OTP,
            };

            return Response.successResponseWithoutData(
              res,
              res.__("resendOtpMobile"),
              SUCCESS
            );
          } else {
            Response.errorResponseWithoutData(
              res,
              res.locals.__("userNotExist"),
              FAIL
            );
          }
        }
      });
    } catch (error) {
      return Response.errorResponseData(res, res.__("internalError"), error);
    }
  },
};
