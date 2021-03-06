const spicedPg = require("spiced-pg");
const db = spicedPg(
    process.env.DATABASE_URL ||
        "postgres:postgres:postgres@localhost:5432/petition"
);

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

module.exports.getUserAndUserProfile = (userId) => {
    return db.query(
        `
            SELECT first_name, last_name, email, age, city, url FROM users
            LEFT JOIN user_profiles ON user_profiles.user_id = users.id
            WHERE users.id = $1
        `,
        [userId]
    );
};

module.exports.updateUser = (firstName, lastName, email, userId) => {
    return db.query(
        `
            UPDATE users
            SET first_name = $1,
                last_name = $2,
                email = $3
            WHERE id = $4
        `,
        [firstName, lastName, email, userId]
    );
};

module.exports.updateUserPassword = (password, userId) => {
    return db.query(
        `
            UPDATE users
            SET password_hash = $1
            WHERE id = $2
        `,
        [password, userId]
    );
};

module.exports.upsertUserProfile = (age, city, url, userId) => {
    return db.query(
        `
            INSERT INTO user_profiles (age, city, url, user_id)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (user_id)
            DO UPDATE SET age = $1, city = $2, url = $3
            
        `,
        [age, city, url, userId]
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
        `,
        [userId, signature]
    );
};

module.exports.getSigners = () => {
    return db.query(
        `
            SELECT first_name, last_name, age, city, url FROM signatures
            JOIN users ON signatures.user_id = users.id
            LEFT JOIN user_profiles ON user_profiles.user_id = users.id
            ORDER BY signatures.created_at DESC;
    
        `
    );
};

module.exports.getSignersByCity = (city) => {
    return db.query(
        `
            SELECT first_name, last_name, age, city, url FROM signatures
            JOIN users ON signatures.user_id = users.id
            LEFT JOIN user_profiles ON user_profiles.user_id = users.id
            WHERE LOWER(city) = LOWER($1)
            ORDER BY signatures.created_at DESC;
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

module.exports.deleteSignature = (userId) => {
    return db.query(
        `
            DELETE FROM signatures
            WHERE user_id = $1
        `,
        [userId]
    );
};

module.exports.deleteProfile = (userId) => {
    return db.query(
        `
            DELETE FROM users
            WHERE id = $1
        `,
        [userId]
    );
};
