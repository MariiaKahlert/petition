const { app } = require("../server");
const { getSignature, deleteSignature } = require("../db");

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

// Delete signature

app.post("/thanks", (req, res) => {
    deleteSignature(req.session.userId)
        .then(() => res.redirect("/petition"))
        .catch((err) => console.log(err));
});
