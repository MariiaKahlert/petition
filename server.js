const { signPetition, getFirstAndLastNames } = require("./db");

// Require express
const express = require("express");
const app = express();

// Require express-handlebars
const hb = require("express-handlebars");
app.engine("handlebars", hb());
app.set("view engine", "handlebars");

// Require cookie-parser
const cp = require("cookie-parser");
app.use(cp());

app.use(
    express.urlencoded({
        extended: false,
    })
);

// Serve static files from public folder
app.use(express.static("public"));

app.get("/petition", (req, res) => {
    if (req.cookies.signedPetition) {
        return res.redirect("/thanks");
    }
    res.render("petition", {
        layout: "main",
    });
});

app.post("/petition", (req, res) => {
    const {
        "first-name": firstName,
        "last-name": lastName,
        signature,
    } = req.body;
    signPetition(firstName, lastName, signature)
        .then(() => {
            res.cookie("signedPetition", "true");
            res.redirect("/thanks");
        })
        .catch(() => {
            res.render("petition", {
                layout: "main",
                error: true,
            });
        });
});

app.get("/thanks", (req, res) => {
    if (!req.cookies.signedPetition) {
        return res.redirect("/petition");
    }
    res.render("thanks", {
        layout: "main",
    });
});

app.get("/signers", (req, res) => {
    if (!req.cookies.signedPetition) {
        return res.redirect("/petition");
    }
    getFirstAndLastNames()
        .then((result) => {
            res.render("signers", {
                layout: "main",
                signers: result.rows,
            });
        })
        .catch();
});

app.listen(8080, () => console.log("Server listening on port 8080"));
