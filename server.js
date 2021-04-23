const {
    insertUser,
    getUser,
    createProfile,
    signPetition,
    getSigners,
    getSignature,
    getSignersByCity,
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

// Middleware to check if there's userId in cookie session and redirect to login page if not
app.use((req, res, next) => {
    const urls = ["/profile", "/petition", "/thanks", "/signers"];
    if (urls.includes(req.url) && !req.session.userId) {
        return res.redirect("/login");
    }
    next();
});

// REQUESTS

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
    // Hash password
    hash(password)
        .then((passwordHash) => {
            // Insert user into db
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
        .catch();
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

// Profile

app.get("/profile", (req, res) => {
    res.render("profile", {
        layout: "main",
    });
});

app.post("/profile", (req, res) => {
    const { userId } = req.session;
    let { age, city, "user-url": userUrl } = req.body;
    if (
        userUrl.length !== 0 &&
        !userUrl.startsWith("http://") &&
        !userUrl.startsWith("https://")
    ) {
        userUrl = `http://${userUrl}`;
    }
    createProfile(
        userId,
        age.length !== 0 ? age : null,
        city.length !== 0 ? city : null,
        userUrl.length !== 0 ? userUrl : null
    )
        .then(() => {
            res.redirect("/petition");
        })
        .catch((err) => {
            console.log(err);
            res.render("profile", {
                layout: "main",
                profileError: "Something went wrong. Please, try again.",
            });
        });
});

// Petition

app.get("/petition", (req, res) => {
    getSignature(req.session.userId).then((result) => {
        if (result.rows.length === 0) {
            res.render("petition", {
                layout: "main",
            });
            return;
        }
        res.redirect("/thanks");
    });
});

app.post("/petition", (req, res) => {
    const { userId } = req.session;
    const { signature } = req.body;
    signPetition(userId, signature)
        .then(() => {
            res.redirect("/thanks");
        })
        .catch((err) => {
            console.log(err);
            res.render("petition", {
                layout: "main",
                error: "Something went wrong. Please, try to sign again.",
            });
        });
});

// Thanks

app.get("/thanks", (req, res) => {
    getSignature(req.session.userId)
        .then((result) => {
            if (result.rows.length === 0) {
                return res.redirect("/petition");
            }
            const { signature } = result.rows[0];
            res.render("thanks", {
                layout: "main",
                signature,
            });
        })
        .catch((err) => console.log(err));
});

// Signers

app.get("/signers", (req, res) => {
    getSignature(req.session.userId)
        .then((result) => {
            if (result.rows.length === 0) {
                return res.redirect("/petition");
            }
            getSigners()
                .then((result) => {
                    res.render("signers", {
                        layout: "main",
                        signers: result.rows,
                    });
                })
                .catch((err) => console.log(err));
        })
        .catch((err) => console.log(err));
});

app.get("/signers/:city", (req, res) => {
    getSignature(req.session.userId)
        .then((result) => {
            if (result.rows.length === 0) {
                return res.redirect("/petition");
            }
            getSignersByCity(req.params.city).then((result) => {
                res.render("signers", {
                    layout: "main",
                    signers: result.rows,
                    cityParam: req.params.city,
                });
            });
        })
        .catch((err) => console.log(err));
});

app.listen(8080, () => console.log("Server listening on port 8080"));
