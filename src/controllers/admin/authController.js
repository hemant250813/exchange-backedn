const bcrypt = require('bcrypt');
const Transformer = require("object-transformer");
const Response = require('../../services/Response');
const { INTERNAL_SERVER, SUCCESS, FAIL } = require('../../services/Constants');
const {
    loginValidation, changePasswordValidation
} = require('../../services/AdminValidation');
const { Login } = require("../../transformers/admin/authTransformer");
const { User } = require('../../models');
const { issueAdmin } = require('../../services/Admin_jwtToken');

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

                    if (requestParams.email && requestParams.email !== "") {
                        findQuery = {
                            email: { $eq: requestParams.email }
                        }
                    } else if (requestParams.mobile_no && requestParams.mobile_no !== "") {
                        findQuery = {
                            mobile_no: { $eq: requestParams.mobile_no }
                        }
                    } else if (requestParams.username && requestParams.username !== "") {
                        findQuery = {
                            username: { $eq: requestParams.username }
                        }
                    }

                    let admin = await User.findOne(findQuery, { password: 1, username: 1, email: 1, mobile_no: 1, user_type: 1, createdAt: 1, updatedAt: 1 });
                    if (admin) {
                        const COMPARE_PASSWORD = await bcrypt.compare(
                            requestParams.password,
                            admin.password
                        );
                        if (COMPARE_PASSWORD) {
                            const ADMIN_TOKEN_EXPIRY_TIME =
                                Math.floor(Date.now() / 1000) +
                                60 * 60 * 24 * process.env.SUPER_ADMIN_TOKEN_EXP;
                            const PAYLOAD = {
                                id: admin._id,
                                user_type: admin.user_type,
                                exp: ADMIN_TOKEN_EXPIRY_TIME,
                            };

                            let token = issueAdmin(PAYLOAD);
                            const META = { token };
                            return Response.successResponseData(
                                res,
                                new Transformer.Single(admin, Login).parse(),
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
   * @description This function is for change Password of admin.
   * @param req
   * @param res
   */
    changePassword: async (req, res) => {
        try {
            const { authUserId } = req;
            const requestParams = req.body;

            changePasswordValidation(requestParams, res, async (validate) => {
                if (validate) {
                    if (requestParams.old_password !== requestParams.password) {
                        const admin = await User.findOne(
                            { _id: authUserId },
                            { password: 1 }
                        );
                        if (admin) {
                            const OLD_PASSWORD_CHECK = await bcrypt.compare(
                                requestParams.old_password,
                                admin.password
                            );
                            if (OLD_PASSWORD_CHECK) {
                                const HASH_PASSWORD = await bcrypt.hashSync(
                                    requestParams.password,
                                    10
                                );
                                await User.updateOne(
                                    { _id: authUserId },
                                    { $set: { password: HASH_PASSWORD } }
                                );
                                return Response.successResponseWithoutData(
                                    res,
                                    res.locals.__("passwordChangedSuccessfully"),
                                    SUCCESS
                                );
                            } else {
                                return Response.errorResponseWithoutData(
                                    res,
                                    res.locals.__("oldPasswordNotExist"),
                                    FAIL
                                );
                            }
                        } else {
                            return Response.errorResponseWithoutData(
                                res,
                                res.locals.__("userNotExist"),
                                FAIL
                            );
                        }
                    } else {
                        return Response.errorResponseWithoutData(
                            res,
                            res.locals.__("oldPasswordShouldNotSameToNewPassword"),
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
    }
}
