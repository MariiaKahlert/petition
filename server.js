const {
    insertUser,
    getUser,
    signPetition,
    getFirstAndLastNames,
    getSignature,
} = require("./db");
const { "cookie-secret": cookieSecret } = require("./secrets.json");
const { hash, compare } = require("./utils/bcrypt");

// Require express
const express = require("express");
const app = express();
// Require express-handlebars
const hb = require("express-handlebars");
app.engine("handlebars", hb());
app.set("view engine", "handlebars");
// Require cookie-session
const cookieSession = require("cookie-session");
// Require csurf
const csurf = require("csurf");

// MIDDLEWARES

// cookieSession middleware
app.use(
    cookieSession({
        secret: cookieSecret,
        maxAge: 1000 * 60 * 60 * 24 * 14,
    })
);

// urlencoded middleware
app.use(
    express.urlencoded({
        extended: false,
    })
);

// csurf middleware
app.use(csurf());

// clickjacking and CSRF middleware
app.use((req, res, next) => {
    res.setHeader("x-frame-options", "deny");
    res.locals.csrfToken = req.csrfToken();
    next();
});

// Serve static files from public folder
app.use(express.static("public"));

// REQUESTS

// Register
app.get("/register", (req, res) => {
    res.render("register", {
        layout: "main",
    });
});

app.post("/register", (req, res) => {
    console.log(req.body);
    const {
        "register-first": firstName,
        "register-last": lastName,
        "register-email": email,
        "register-password": password,
    } = req.body;
    // Hash password
    hash(password)
        .then((passwordHash) => {
            // Insert user into db
            insertUser(firstName, lastName, email, passwordHash)
                .then((result) => {
                    console.log(result);
                    const { id } = result.rows[0];
                    req.session.userId = id;
                    res.redirect("/petition");
                })
                .catch((err) => {
                    console.log(err);
                    res.render("register", {
                        layout: "main",
                        error: "Invalid user input",
                    });
                });
        })
        .catch();
});

// Log in
app.get("/login", (req, res) => {
    res.render("login", {
        layout: "main",
    });
});

app.post("/login", (req, res) => {
    console.log(req.body);
    const { email, password } = req.body;
    getUser(email)
        .then((result) => {
            if (!result.row[0].email) {
                res.render("login", {
                    layout: "main",
                    noUserError: "No user exists for this email!",
                });
                return;
            }
            console.log(result.row[0]);
            compare(password, result.row[0].password_hash).then((match) => {
                if (match === true) {
                    req.session.userId = result.row[0].id;
                    res.redirect("/petition");
                } else {
                    res.render("login", {
                        layout: "main",
                        wrongPassword: "Wrong password!",
                    });
                }
            });
        })
        .catch((err) => {
            console.log(err);
            res.render("login", {
                layout: "main",
                error: "Wrong user input",
            });
        });
});

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
                signature,
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
