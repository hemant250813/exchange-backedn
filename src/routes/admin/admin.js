const router = require("express").Router();
const connect = require("connect");
const { adminTokenAuth } = require("../../middlewares/admin");


const authMiddleware = (() => {
  const chain = connect();
  [adminTokenAuth].forEach((middleware) => {
    chain.use(middleware);
  });
  return chain;
})();

// lrf

module.exports = router;
