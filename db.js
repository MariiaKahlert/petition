const spicedPg = require("spiced-pg");
const db = spicedPg("postgres:postgres:postgres@localhost:5432/petition");

module.exports.insertUser = (firstName, lastName, email, passwordHash) => {
    return db.query(
        `
            INSERT INTO users (first_name, last_name, email, password_hash)
            VALUES ($1, $2, $3, $4)
            RETURNING id
        `,
        [firstName, lastName, email, passwordHash]
    );
};

module.exports.signPetition = (firstName, lastName, signature) => {
    return db.query(
        `
            INSERT INTO signatures (first_name, last_name, signature)
            VALUES ($1, $2, $3)
            RETURNING id
        `,
        [firstName, lastName, signature]
    );
};

module.exports.getFirstAndLastNames = () => {
    return db.query(
        `
            SELECT first_name, last_name FROM signatures
        `
    );
};

module.exports.getSignature = (signatureId) => {
    return db.query(
        `
        SELECT signature FROM signatures
        WHERE id = ${signatureId}
        `
    );
};
