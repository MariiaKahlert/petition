const { app } = require("../server");
const { hash, compare } = require("../utils/bcrypt");
const { insertUser, getUser } = require("../db");

// Register

app.get("/register", (req, res) => {
    res.render("register", {
        layout: "main",
    });
});

app.post("/register", (req, res) => {
    const {
        "register-first": firstName,
        "register-last": lastName,
        "register-email": email,
        "register-password": password,
    } = req.body;
    hash(password)
        .then((passwordHash) => {
            insertUser(firstName, lastName, email, passwordHash)
                .then((result) => {
                    const { id } = result.rows[0];
                    req.session.userId = id;
                    res.redirect("/profile");
                })
                .catch((err) => {
                    console.log(err);
                    res.render("register", {
                        layout: "main",
                        error: "Invalid user input...",
                    });
                });
        })
        .catch((err) => console.log(err));
});

// Log in

app.get("/login", (req, res) => {
    res.render("login", {
        layout: "main",
    });
});

app.post("/login", (req, res) => {
    const { "login-email": email, "login-password": password } = req.body;
    getUser(email)
        .then((result) => {
            if (result.rows.length === 0) {
                res.render("login", {
                    layout: "main",
                    noUserError: "No user exists for this email...",
                });
                return;
            }
            compare(password, result.rows[0].password_hash).then((match) => {
                if (match === true) {
                    req.session.userId = result.rows[0].id;
                    res.redirect("/petition");
                } else {
                    res.render("login", {
                        layout: "main",
                        wrongPassword: "Wrong password...",
                    });
                }
            });
        })
        .catch((err) => {
            console.log(err);
            res.render("login", {
                layout: "main",
                error: "Wrong user input...",
            });
        });
});

// Log out

app.get("/logout", (req, res) => {
    req.session = null;
    res.redirect("/login");
});
