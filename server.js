const {
    insertUser,
    getUser,
    getUserAndUserProfile,
    updateUser,
    updateUserPassword,
    upsertUserProfile,
    createProfile,
    signPetition,
    getSigners,
    getSignersByCity,
    getSignature,
    deleteSignature,
    deleteProfile,
} = require("./db");

const profileRouter = require("./routers/profile");

let cookieSecret;
if (process.env.COOKIE_SECRET) {
    cookieSecret = process.env.COOKIE_SECRET;
} else {
    cookieSecret = require("./secrets.json")["cookie-secret"];
}

const { hash, compare } = require("./utils/bcrypt");

// Require express
const express = require("express");
const app = express();
module.exports.app = app;

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
// {maxAge: 1000 * 60 * 60 * 24 * 14}

// Middleware to check if there's userId in cookie session and redirect to login page if not
app.use((req, res, next) => {
    const urls = [
        "/profile",
        "/profile/edit",
        "/profile/delete",
        "/petition",
        "/thanks",
        "/signers",
        "/logout",
    ];
    if (urls.includes(req.url) && !req.session.userId) {
        return res.redirect("/login");
    } else if (
        (req.url === "/register" || req.url === "/login") &&
        req.session.userId
    ) {
        return res.redirect("/petition");
    }
    next();
});

// REQUESTS

// Root route

app.get("/", (req, res) => {
    res.redirect("/register");
});

// Register, log in, log out
require("./routers/auth");

// Profile, edit profile, delete profile

app.use("/profile", profileRouter);

// Petition

require("./routers/petition");

// Thanks

require("./routers/thanks");

// Signers

app.get("/signers", (req, res) => {
    getSignature(req.session.userId)
        .then((signatureResult) => {
            if (signatureResult.rows.length === 0) {
                return res.redirect("/petition");
            }
            getSigners()
                .then((result) => {
                    console.log(result);
                    console.log(req.session.userId);
                    res.render("signers", {
                        layout: "main",
                        signers: result.rows,
                        numOfSigners: result.rowCount,
                        hasSigned: signatureResult.rows.length !== 0,
                    });
                })
                .catch((err) => console.log(err));
        })
        .catch((err) => console.log(err));
});

app.get("/signers/:city", (req, res) => {
    getSignature(req.session.userId)
        .then((signatureResult) => {
            if (signatureResult.rows.length === 0) {
                return res.redirect("/petition");
            }
            getSignersByCity(req.params.city).then((result) => {
                res.render("signers", {
                    layout: "main",
                    signers: result.rows,
                    cityParam: req.params.city,
                    hasSigned: signatureResult.rows.length !== 0,
                });
            });
        })
        .catch((err) => console.log(err));
});

// Log out

app.listen(process.env.PORT || 8080, () =>
    console.log("Server listening on port 8080")
);
