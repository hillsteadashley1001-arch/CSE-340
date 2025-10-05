// server.js
require("dotenv").config();
const path = require("path");
const express = require("express");
const expressLayouts = require("express-ejs-layouts");

const app = express();

// Views
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(expressLayouts);
// Optional: explicitly set layout file name
app.set("layout", "layout"); // uses views/layout.ejs

// Static
app.use(express.static(path.join(__dirname, "public")));

// Default title fallback
app.use((req, res, next) => {
  res.locals.title = "CSE Motors";
  next();
});

// Routes
app.get("/", (req, res) => {
  res.render("index", { title: "Home" });
});

// 404
app.use((req, res) => {
  res.status(404).render("404", { title: "Not Found" });
});

const PORT = process.env.PORT || 5500;
const HOST = process.env.HOST || "localhost";
app.listen(PORT, () => {
  console.log(`app listening on ${HOST}:${PORT}`);
});