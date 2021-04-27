const profileRouter = require("./routers/profile");
const signersRouter = require("./routers/signers");

let cookieSecret;
if (process.env.COOKIE_SECRET) {
    cookieSecret = process.env.COOKIE_SECRET;
} else {
    cookieSecret = require("./secrets.json")["cookie-secret"];
}

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

// 1. cookieSession middleware
app.use(
    cookieSession({
        secret: cookieSecret,
        maxAge: 1000 * 60 * 60 * 24 * 14,
    })
);

// 2. urlencoded middleware
app.use(
    express.urlencoded({
        extended: false,
    })
);

// 3. csurf middleware
app.use(csurf());

// 4. clickjacking and CSRF middleware
app.use((req, res, next) => {
    res.setHeader("x-frame-options", "deny");
    res.locals.csrfToken = req.csrfToken();
    next();
});

// 5. Serve static files from public folder
app.use(express.static("public"));
// {maxAge: 1000 * 60 * 60 * 24 * 14}

// 6. Middleware to check if there's userId in cookie session
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
app.use("/signers", signersRouter);

app.listen(process.env.PORT || 8080, () =>
    console.log("Server listening on port 8080")
);
