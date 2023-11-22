const bcrypt = require("bcrypt");
const Transformer = require("object-transformer");
const Response = require("../../services/Response");
const {
  ACTIVE,
  INTERNAL_SERVER,
  SUCCESS,
  FAIL,
  MAIL_SUBJECT_FORGET_PASSWORD,
} = require("../../services/Constants");
const {
  generateRandomNumber,
  AppName,
  forgotTemplate,
} = require("../../services/Helper");
const Mailer = require("../../services/Mailer");
const {
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
} = require("../../services/UserValidation");
const { Login } = require("../../transformers/user/authTransformer");
const { User, Profile } = require("../../models");
const { issueUser } = require("../../services/User_jwtToken");

module.exports = {
  /**
   * @description "This function is for user login."
   * @param req
   * @param res
   */
  login: async (req, res) => {
    try {
      const requestParams = req.body;
      loginValidation(requestParams, res, async (validate) => {
        if (validate) {
          let findQuery = {};

          findQuery = {
            $or: [
              { email: { $eq: requestParams.email } },
              { mobile_no: { $eq: requestParams.mobile_no } },
            ],
          };
          let user = await User.findOne(findQuery, {
            status: 1,
            password: 1,
            email: 1,
            mobile_no: 1,
            createdAt: 1,
            updatedAt: 1,
          });

          if (user) {
            if (user?.status === ACTIVE) {
              if (user?.verified !== null) {
                const COMPARE_PASSWORD = await bcrypt.compare(
                  requestParams.password,
                  user.password
                );
                if (COMPARE_PASSWORD) {
                  const USER_TOKEN_EXPIRY_TIME =
                    Math.floor(Date.now() / 1000) +
                    60 * 60 * 24 * process.env.USER_TOKEN_EXP;
                  const PAYLOAD = {
                    id: user._id,
                    exp: USER_TOKEN_EXPIRY_TIME,
                  };

                  let token = issueUser(PAYLOAD);
                  const META = { token };

                  const userDataWithImageLink = {
                    id: user?.id,
                    email: user?.email,
                    verified: user?.verified,
                    status: user?.status,
                  };
                  return Response.successResponseData(
                    res,
                    new Transformer.Single(
                      userDataWithImageLink,
                      Login
                    ).parse(),
                    SUCCESS,
                    res.locals.__("loginSuccess"),
                    META
                  );
                } else {
                  return Response.errorResponseWithoutData(
                    res,
                    res.locals.__("passwordNotMatch"),
                    FAIL
                  );
                }
              } else {
                Response.errorResponseWithoutData(
                  res,
                  res.locals.__("notVerified"),
                  FAIL
                );
              }
            } else {
              Response.errorResponseWithoutData(
                res,
                res.locals.__("accountIsInactive"),
                FAIL
              );
            }
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
      return Response.errorResponseData(
        res,
        res.__("internalError"),
        INTERNAL_SERVER
      );
    }
  },

  /**
   * @description This function is for Forgot Password of user.
   * @param req
   * @param res
   */
  forgotPassword: async (req, res) => {
    try {
      const requestParams = req.body;
      forgotPasswordValidation(requestParams, res, async (validate) => {
        if (validate) {
          let findQuery = {};

          if (requestParams.email && requestParams.email !== "") {
            findQuery = {
              email: { $eq: requestParams.email },
            };
          } else if (
            requestParams.mobile_no &&
            requestParams.mobile_no !== ""
          ) {
            findQuery = {
              mobile_no: { $eq: requestParams.mobile_no },
            };
          }

          let user = await User.findOne(findQuery, {
            status: 1,
            verified: 1,
          });

          if (user) {
            if (user?.status === ACTIVE) {
              if (user?.verified !== null) {
                const CURRENT_DATE = new Date();
                const OTP_TOKEN_EXPIRE = new Date(
                  CURRENT_DATE.getTime() + process.env.OTP_EXPIRY_MINUTE * 60000
                );
                const OTP = await generateRandomNumber(6);

                let query = {};
                if (requestParams.email && requestParams.email !== "") {
                  query = { email: { $eq: requestParams.email } };
                } else {
                  query = { mobile_no: { $eq: requestParams.mobile_no } };
                }
                await User.updateOne(query, {
                  $set: {
                    otp: OTP,
                    otp_expiry: OTP_TOKEN_EXPIRE,
                  },
                });

                const LOCALS = {
                  appName: AppName,
                  otp: OTP,
                };
                await Mailer.sendMail(
                  requestParams.email,
                  MAIL_SUBJECT_FORGET_PASSWORD,
                  forgotTemplate,
                  LOCALS
                );

                if (requestParams.email && requestParams.email !== "") {
                  return Response.successResponseWithoutData(
                    res,
                    res.__("forgetOtpEmail"),
                    SUCCESS
                  );
                } else {
                  return Response.successResponseWithoutData(
                    res,
                    res.__("forgetOtpMobile"),
                    SUCCESS
                  );
                }
              } else {
                Response.errorResponseWithoutData(
                  res,
                  res.locals.__("notVerified"),
                  FAIL
                );
              }
            } else {
              Response.errorResponseWithoutData(
                res,
                res.locals.__("accountIsInactive"),
                FAIL
              );
            }
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
      return Response.errorResponseData(res, error.message, INTERNAL_SERVER);
    }
  },

  /**
   * @description This function is for reset Password of user with otp verification.
   * @param req
   * @param res
   */
  resetPassword: async (req, res) => {
    try {
      const requestParams = req.body;
      resetPasswordValidation(requestParams, res, async (validate) => {
        if (validate) {
          let user = await User.findOne(
            { otp: { $eq: requestParams.otp } },
            { otp_expiry: 1, password: 1 }
          );
          if (user) {
            const CURRENT_TIME = new Date();
            const OTP_TOKEN_EXPIRE = new Date(user.otp_expiry);

            if (CURRENT_TIME.getTime() < OTP_TOKEN_EXPIRE.getTime()) {
              const HASH_PASSWORD = bcrypt.hashSync(
                requestParams?.password,
                10
              );
              await User.updateOne(
                { otp: { $eq: requestParams.otp } },
                {
                  $set: {
                    password: HASH_PASSWORD,
                    otp_expiry: null,
                  },
                }
              );
              return Response.successResponseWithoutData(
                res,
                res.locals.__("passwordResetSuccessfully"),
                SUCCESS
              );
            } else {
              return Response.errorResponseWithoutData(
                res,
                res.locals.__("otpExpired"),
                FAIL
              );
            }
          } else {
            return Response.errorResponseWithoutData(
              res,
              res.locals.__("invalidOtp"),
              FAIL
            );
          }
        }
      });
    } catch (error) {
      return Response.errorResponseData(
        res,
        res.__("internalError"),
        Constants.INTERNAL_SERVER
      );
    }
  },
};
