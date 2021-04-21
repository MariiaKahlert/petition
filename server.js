const { signPetition, getFirstAndLastNames, getSignature } = require("./db");
const { "cookie-secret": cookieSecret } = require("./secrets.json");

// Require express
const express = require("express");
const app = express();

// Require express-handlebars
const hb = require("express-handlebars");
app.engine("handlebars", hb());
app.set("view engine", "handlebars");

// Require cookie-session
const cookieSession = require("cookie-session");
app.use(
    cookieSession({
        secret: cookieSecret,
        maxAge: 1000 * 60 * 60 * 24 * 14,
    })
);

app.use(
    express.urlencoded({
        extended: false,
    })
);

// Serve static files from public folder
app.use(express.static("public"));

app.get("/petition", (req, res) => {
    if (req.session.signatureId) {
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
        .then((result) => {
            const { id } = result.rows[0];
            req.session.signatureId = id;
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
    if (!req.session.signatureId) {
        return res.redirect("/petition");
    }
    getSignature(req.session.signatureId)
        .then((result) => {
            const { signature } = result.rows[0];
            res.render("thanks", {
                layout: "main",
                signature: signature,
            });
        })
        .catch();
});

app.get("/signers", (req, res) => {
    if (!req.session.signatureId) {
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
