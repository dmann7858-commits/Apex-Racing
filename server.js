const path = require("path");
const express = require("express");
const apiRoutes = require("./src/routes/api");

const app = express();
const PORT = process.env.PORT || 3000; // Render sets PORT for you

app.disable("x-powered-by");
app.use(express.json());

/* API */
app.use("/api", apiRoutes);

/* Front end (HTML, CSS, JS, images) */
app.use(
  express.static(path.join(__dirname, "public"), {
    maxAge: process.env.NODE_ENV === "production" ? "1h" : 0,
  })
);

/* Any other URL loads the app (the app handles its own pages) */
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

/* Errors — log the detail, send a clear message */
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message || "Something went wrong on the server." });
});

app.listen(PORT, () => {
  console.log(`Apex Racing running on http://localhost:${PORT}`);
  console.log(`Data source: ${process.env.DATA_SOURCE || "mock"}`);
});
