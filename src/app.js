const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");

const apiRoutes = require("./routes");
const { notFoundHandler, errorHandler } = require("./middlewares/error.middleware");

const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (_req, res) => {
  res.json({
    message: "CogniCare API is running",
  });
});

app.use("/api", apiRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
