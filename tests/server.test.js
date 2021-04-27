const supertest = require("supertest");
const { app } = require("../server");
const cookieSession = require("cookie-session");
const db = require("../db");
jest.mock("../db");

// 1.
test("GET /petition sends a 302 status code and redirects to /register when a user is NOT logged in", () => {
    cookieSession.mockSessionOnce({});
    return supertest(app)
        .get("/petition")
        .then((response) => {
            expect(response.statusCode).toBe(302);
            expect(response.headers.location).toBe("/register");
        });
});

// 2.
for (let route of ["/register", "/login"]) {
    test(`GET ${route} sends a 302 status code and redirects to /petition when a user is logged in`, () => {
        cookieSession.mockSessionOnce({
            userId: 1,
        });
        return supertest(app)
            .get(route)
            .then((response) => {
                expect(response.statusCode).toBe(302);
                expect(response.headers.location).toBe("/petition");
            });
    });
}

// 3.
test("GET /petition sends a 302 status code and redirects to /thanks when a user is logged in and has signed the petition", () => {
    cookieSession.mockSessionOnce({
        userId: 1,
    });
    db.getSignature.mockResolvedValue({
        rows: [{ signature: "signature" }],
    });
    return supertest(app)
        .get("/petition")
        .then((response) => {
            expect(response.statusCode).toBe(302);
            expect(response.headers.location).toBe("/thanks");
        });
});

test("POST /petition sends a 302 status code and redirects to /thanks when a user is logged in and has signed the petition", () => {
    cookieSession.mockSessionOnce({
        userId: 1,
    });
    db.signPetition.mockResolvedValue({
        rows: [],
    });
    return supertest(app)
        .post("/petition")
        .then((response) => {
            expect(response.statusCode).toBe(302);
            expect(response.headers.location).toBe("/thanks");
        });
});

test("POST /petition with bad input responses with error message", () => {
    cookieSession.mockSessionOnce({
        userId: 1,
    });
    db.signPetition.mockRejectedValue();
    return supertest(app)
        .post("/petition")
        .then((response) => {
            expect(response.text).toContain(
                "Something went wrong. Please, try to sign again."
            );
        });
});

// 4.
for (let route of ["/thanks", "/signers"]) {
    test(`GET ${route} sends a 302 status code and redirects to /petition when a user is logged in and has NOT signed the petition`, () => {
        cookieSession.mockSessionOnce({
            userId: 1,
        });
        db.getSignature.mockResolvedValue({
            rows: [],
        });
        return supertest(app)
            .get(route)
            .then((response) => {
                expect(response.statusCode).toBe(302);
                expect(response.headers.location).toBe("/petition");
            });
    });
}
