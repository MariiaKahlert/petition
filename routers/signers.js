const express = require("express");
const router = express.Router();
module.exports = router;
const { getSignature, getSigners, getSignersByCity } = require("../db");

router.get("/", (req, res) => {
    getSignature(req.session.userId)
        .then((signatureResult) => {
            if (signatureResult.rows.length === 0) {
                return res.redirect("/petition");
            }
            getSigners()
                .then((result) => {
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

router.get("/:city", (req, res) => {
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
