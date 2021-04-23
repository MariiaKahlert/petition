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

module.exports.createProfile = (userId, age, city, userUrl) => {
    return db.query(
        `
            INSERT INTO user_profiles (user_id, age, city, url)
            VALUES ($1, $2, $3, $4)
        `,
        [userId, age, city, userUrl]
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

module.exports.getSigners = () => {
    return db.query(
        `
            SELECT first_name, last_name, age, city, url FROM user_profiles
            JOIN users ON user_profiles.user_id = users.id
            JOIN signatures ON signatures.user_id = users.id
    
        `
    );
};

module.exports.getSignersByCity = (city) => {
    return db.query(
        `
            SELECT first_name, last_name, age, city, url FROM user_profiles
            JOIN users ON user_profiles.user_id = users.id
            JOIN signatures ON signatures.user_id = users.id
            WHERE LOWER(city) = LOWER($1)
        `,
        [city]
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
