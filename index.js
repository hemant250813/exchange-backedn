const express = require("express");
const morgan = require("morgan");
const path = require("path");
const cors = require("cors");
require("dotenv").config();

// import i18n
const i18n = require("./src/i18n/i18n");

// set port
const port = process.env.PORT || 8080;

global.__basedir = `${__dirname}/`;

// create express application
const app = express();

// app configuration
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "pug");
app.set("views", path.join(`${__dirname}/src`, "views"));
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms")
);
app.use(i18n);

app.use(
  cors({
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);

// cors setup
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  next();
});

// import db
const { connect } = require("./src/config/dbConnection");
connect();

// import routes
const indexRoute = require("./src/routes");

app.use("/", indexRoute);

//server listening to port
app.listen(port, () => {
  console.log(`Server listening on the port  ${port}`);
});
