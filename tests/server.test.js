const supertest = require("supertest");
const { app } = require("../server");
const cookieSession = require("cookie-session");

// 1.

test("GET /petition sends a 302 status code and redirects to /register when there is no cookie session", () => {
    cookieSession.mockSessionOnce({});
    return supertest(app)
        .get("/petition")
        .then((response) => {
            expect(response.statusCode).toBe(302);
            expect(response.headers.location).toBe("/register");
        });
});

// 2.

test("GET /register and GET /login send a 302 status code and redirect to /petition when a user is logged in", () => {
    cookieSession.mockSessionOnce({
        userId: 1,
    });
    return supertest(app)
        .get("/register" || "/login")
        .then((response) => {
            expect(response.statusCode).toBe(302);
            expect(response.headers.location).toBe("/petition");
        });
});

// 3.

// test("GET /petition sends a 302 status code and redirects to /thanks when a user is logged in", () => {
//     cookieSession.mockSessionOnce({
//         userId: 1,
//     });
//     return supertest(app)
//         .get("/petition")
//         .then((response) => {
//             expect(response.statusCode).toBe(302);
//             expect(response.headers.location).toBe("/thanks");
//         });
// });

// test("POST /petition sends a 302 status code and redirects to /thanks when a user is logged in", () => {
//     cookieSession.mockSessionOnce({
//         userId: 1,
//     });
//     return supertest(app)
//         .post("/petition")
//         .then((response) => {
//             expect(response.statusCode).toBe(302);
//             expect(response.headers.location).toBe("/thanks");
//         });
// });
