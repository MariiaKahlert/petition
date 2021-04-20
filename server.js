const {} = require("./db");

// Require express
const express = require("express");
const app = express();

// Require express-handlebars
const hb = require("express-handlebars");
app.engine("handlebars", hb());
app.set("view engine", "handlebars");

// Serve static files from public folder
app.use(express.static("public"));

app.get("/petition", (req, res) => {
    res.render("petition", {
        layout: "main",
    });
});

app.listen(8080, () => console.log("Server listening on port 8080"));
