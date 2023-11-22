const router = require("express").Router();
const connect = require("connect");
const { userTokenAuth } = require("../../middlewares/user");

const {
  login,
  forgotPassword,
  resetPassword,
} = require("../../controllers/api/authController");

const { userRegistration, verify } = require("../../controllers/api/userController");

const authMiddleware = (() => {
  const chain = connect();
  [userTokenAuth].forEach((middleware) => {
    chain.use(middleware);
  });
  return chain;
})();

// auth lrf
router.post("/login", login);
router.post("/forget-password", forgotPassword);
router.post("/reset-password", resetPassword);

// user
router.post("/registration", userRegistration);
router.post("/otp-verify", verify);

module.exports = router;
