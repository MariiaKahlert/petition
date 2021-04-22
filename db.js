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

module.exports.getUser = (email) => {
    return db.query(
        `
            SELECT * FROM users
            WHERE email = $1
        `,
        [email]
    );
};

module.exports.signPetition = (userId, signature) => {
    return db.query(
        `
            INSERT INTO signatures (user_id, signature)
            VALUES ($1, $2)
            RETURNING id
        `,
        [userId, signature]
    );
};

module.exports.getFirstAndLastNames = () => {
    return db.query(
        `
            SELECT first_name, last_name FROM users
            JOIN signatures ON signatures.user_id = users.id
        `
    );
};

module.exports.getSignature = (userId) => {
    return db.query(
        `
        SELECT signature FROM signatures
        WHERE user_id = $1
        `,
        [userId]
    );
};
