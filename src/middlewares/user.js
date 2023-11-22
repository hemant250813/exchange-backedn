const Response = require("../services/Response");
const jwToken = require("../services/User_jwtToken.js");
const { User } = require("../models");
const { INACTIVE, ACTIVE, UNAUTHORIZED, UNAUTHENTICATED, INTERNAL_SERVER } = require("../services/Constants");

module.exports = {
  /**
   * @description "This function is used to authenticate and authorize a user."
   * @param req
   * @param res
   */
  userTokenAuth: async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      if (!token) {
        Response.errorResponseWithoutData(
          res,
          res.locals.__("authorizationError"),
          UNAUTHORIZED
        );
      } else {
        const tokenData = await jwToken.decode(token);
        if (tokenData) {
          const decoded = await jwToken.verify(tokenData);
          if (decoded.id) {
            req.authUserId = decoded.id;
            req.user_type = decoded.user_type;
            // eslint-disable-next-line consistent-return
            const user = await User.findOne(
              { _id: req.authUserId }
            );
            if (user) {
              if (user && user.status === INACTIVE) {
                return Response.errorResponseWithoutData(
                  res,
                  res.locals.__("accountIsInactive"),
                  UNAUTHENTICATED
                );
              }
              if (user && user.status === ACTIVE) {
                return next();
              } else {
                return Response.errorResponseWithoutData(
                  res,
                  res.locals.__("accountBlocked"),
                  UNAUTHENTICATED
                );
              }
            } else {
              return Response.errorResponseWithoutData(
                res,
                res.locals.__("invalidToken"),
                UNAUTHENTICATED
              );
            }
          } else {
            return Response.errorResponseWithoutData(
              res,
              res.locals.__("invalidToken"),
              UNAUTHENTICATED
            );
          }
        } else {
          return Response.errorResponseWithoutData(
            res,
            res.locals.__("invalidToken"),
            UNAUTHENTICATED
          );
        }
      }
    } catch (error) {
      return Response.errorResponseData(
        res,
        res.__("internalError"),
        INTERNAL_SERVER
      );
    }
  },
};
