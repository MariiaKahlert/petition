const express = require("express");
const router = express.Router();
module.exports = router;
const { hash } = require("../utils/bcrypt");
const {
    createProfile,
    getSignature,
    getUserAndUserProfile,
    updateUser,
    updateUserPassword,
    upsertUserProfile,
    deleteProfile,
} = require("../db");

// Profile

router.get("/", (req, res) => {
    res.render("profile", {
        layout: "main",
    });
});

router.post("/", (req, res) => {
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

// Edit

router.get("/edit", (req, res) => {
    getSignature(req.session.userId)
        .then((signatureResult) => {
            getUserAndUserProfile(req.session.userId)
                .then((result) => {
                    res.render("edit", {
                        layout: "main",
                        userInfo: result.rows,
                        editProfile: true,
                        hasSigned: signatureResult.rows.length !== 0,
                    });
                })
                .catch((err) => console.log(err));
        })
        .catch((err) => console.log(err));
});

router.post("/edit", (req, res) => {
    const { userId } = req.session;
    const {
        "edit-first": firstName,
        "edit-last": lastName,
        "edit-email": email,
        "edit-password": password,
        "edit-age": age,
        "edit-city": city,
        "edit-user-url": url,
    } = req.body;
    if (password.length !== 0) {
        hash(password).then((passwordHash) => {
            Promise.all([
                updateUser(firstName, lastName, email, userId),
                updateUserPassword(passwordHash, userId),
                upsertUserProfile(age, city, url, userId),
            ])
                .then(() => res.redirect("/thanks"))
                .catch((err) => console.log(err));
        });
    } else {
        Promise.all([
            updateUser(firstName, lastName, email, userId),
            upsertUserProfile(age, city, url, userId),
        ])
            .then(() => res.redirect("/thanks"))
            .catch((err) => console.log(err));
    }
});

// Delete

router.post("/delete", (req, res) => {
    deleteProfile(req.session.userId)
        .then(() => {
            req.session = null;
            res.redirect("/register");
        })
        .catch((err) => console.log(err));
});
