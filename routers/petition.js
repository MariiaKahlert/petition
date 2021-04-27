const { app } = require("../server");
const { getSignature, signPetition } = require("../db");

app.get("/petition", (req, res) => {
    getSignature(req.session.userId).then((result) => {
        console.log(result);
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
