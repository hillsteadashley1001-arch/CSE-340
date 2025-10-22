// app.js
require("dotenv").config();

const path = require("path");
const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");
const compression = require("compression");
const cookieParser = require("cookie-parser");

const app = express();

// ----- Views -----
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ----- Security, performance, logging -----
app.use(
  helmet({
    contentSecurityPolicy: false, // tune CSP for production based on your assets
  })
);
app.use(compression());
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// ----- Parsers -----
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// ----- Static -----
app.use(
  express.static(path.join(__dirname, "public"), {
    maxAge: "7d",
    immutable: true,
    dotfiles: "ignore",
  })
);

// ----- Shared locals (e.g., nav) -----
app.use((req, res, next) => {
  res.locals.nav = res.locals.nav || "";
  next();
});

// ----- Utilities: async wrapper -----
const utils = require("./utilities"); // exports asyncHandler among others

// ----- Routes -----
const inventoryRoute = require("./routes/inventoryRoute");
const siteRoute = require("./routes/siteRoute"); // should include /cause-error

app.use("/inv", inventoryRoute);
app.use("/", siteRoute);

// Example route using async wrapper directly here:
app.get(
  "/healthz",
  utils.asyncHandler(async (req, res) => {
    // If this threw, asyncHandler would forward to error middleware
    res.status(200).send("OK");
  })
);

// ----- 404 (no route matched) -----
app.use((req, res, next) => {
  const err = new Error("Not Found");
  err.status = 404;
  next(err);
});

// ----- Global error handler -----
// Make sure ALL async routes either use utils.asyncHandler or call next(err)
app.use((err, req, res, next) => {
  const status = err.status || 500;

  // Minimal logging; avoid leaking internals in responses
  if (status >= 500) {
    // eslint-disable-next-line no-console
    console.error(err);
  }

  res.status(status);
  res.render("errors/error", {
    title: status === 404 ? "Page Not Found" : "Server Error",
    status,
    message: err.message || "An unexpected error occurred.",
  });
});

// ----- Export or start -----
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Server listening on http://localhost:${PORT}`);
  });
} else {
  module.exports = app;
}