const Response = require('../services/Response');
const jwToken = require('../services/Admin_jwtToken');
const { USER_TYPE, INTERNAL_SERVER, UNAUTHORIZED, UNAUTHENTICATED } = require("../services/Constants");
const { User } = require('../models');

module.exports = {
  /**
   * @description "This function is used to authenticate and authorize a admin."
   * @param req
   * @param res
   */
  adminTokenAuth: async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      if (!token) {
        Response.errorResponseWithoutData(res, res.locals.__('authorizationError'), UNAUTHORIZED);
      } else {
        const tokenData = await jwToken.decode(token);
        if (tokenData) {
          const decoded = await jwToken.verify(tokenData);
          if (decoded.id) {
            req.authAdminId = decoded.id;
            req.user_type = decoded.user_type;
            // eslint-disable-next-line consistent-return
            const admin = await User.findOne({ _id: req.authAdminId }, { _id: 1, user_type: 1 });
            if (admin) {
              if (admin.user_type === USER_TYPE.ADMIN) {
                return next();
              } else {
                return Response.errorResponseWithoutData(
                  res,
                  res.locals.__('invalidToken'),
                  UNAUTHENTICATED
                );
              }
              return next();
            } else {
              return Response.errorResponseWithoutData(
                res,
                res.locals.__('invalidToken'),
                UNAUTHENTICATED
              );
            }
          } else {
            return Response.errorResponseWithoutData(
              res,
              res.locals.__('invalidToken'),
              UNAUTHENTICATED
            );
          }
        } else {
          return Response.errorResponseWithoutData(
            res,
            res.locals.__('invalidToken'),
            UNAUTHENTICATED
          );
        }
      }
    } catch (error) {
      return Response.errorResponseWithoutData(
        res,
        res.__('internalError'),
        INTERNAL_SERVER
      );
    }
  },
}
