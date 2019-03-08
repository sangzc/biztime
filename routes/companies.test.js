process.env.NODE_ENV = "test";
// npm packages
const request = require("supertest");
// app imports
const app = require("../app");
const db = require("../db");

let company;
let invoice;

beforeEach(async () => {

    await db.query("DELETE FROM invoices");
    await db.query("DELETE FROM companies");

    let companyResult = await db.query(
        `INSERT INTO
        companies(code, name, description) VALUES ('test_company', 'Test Company', 'This is a test description.')
       RETURNING code, name, description`)

    company = companyResult.rows[0]

    let invoiceResult = await db.query(
        `INSERT INTO
        invoices (amt, paid, comp_code)
        VALUES (99, true, 'test_company')
        RETURNING id, comp_code, amt, paid, add_date, paid_date`
    )

    invoice = invoiceResult.rows[0]
});

afterEach(async () => {
});

// We need this here to disconnect from the database
afterAll(async () => {
    await db.end();
})

/** GET /items - returns `{items: [item, ...]}` */

describe("GET /companies", async function () {
    test("Gets a list of companies", async function () {
        const response = await request(app).get(`/companies`);
        const { companies } = response.body;
        expect(response.statusCode).toBe(200);
        expect(companies).toHaveLength(1);
    });
});
// end


/** GET /items/[name] - return data about one item: `{item: item}` */

describe("GET /companies/:code", async function () {
    test("Gets a single companie", async function () {
        const response = await request(app).get(`/companies/${company.code}`);
        expect(response.statusCode).toBe(200);
        expect(response.body.company.code).toEqual(company.code);
    });

    test("Responds with 404 if can't find company", async function () {
        const response = await request(app).get(`/companies/999`);
        expect(response.statusCode).toBe(404);
        const responseCoconut = await request(app).get(`/companies/coconut`);
        expect(responseCoconut.statusCode).toBe(404);

    });
});
// end


/** POST /items - create item from data; return `{item: item}` */

describe("POST /companies", async function () {
    test("Creates a new company", async function () {
        const response = await request(app)
            .post(`/companies`)
            .send({
                "code": "test_company1",
                "name": "Test_company1",
                "description": "New test company"
            });
        expect(response.statusCode).toBe(200);
        expect(response.body.company).toHaveProperty("code");
        expect(response.body.company).toHaveProperty("name");
        expect(response.body.company).toHaveProperty("description");
        expect(response.body.company.code).toEqual("test_company1");
        expect(response.body.company.name).toEqual("Test_company1");
        expect(response.body.company.description).toEqual("New test company");
    });
});
// end


// /** PATCH /items/[name] - update item; return `{item: item}` */

describe("PUT /companies/:code", async function () {
    test("Updates a single company", async function () {
        const response = await request(app)
            .put(`/companies/${company.code}`)
            .send({
                "name": "update_test_company",
                "description": "updated test company"
            });
        expect(response.statusCode).toBe(200);
        expect(response.body.company).toEqual({
            "code": company.code,
            "name": "update_test_company",
            "description": "updated test company",
        });
    });

    test("Responds with 404 if can't find company", async function () {   const response = await request(app).put(`/companies/900`);
        expect(response.statusCode).toBe(404);
        const responseCoconut = await request(app).put(`/companies/coconut`);
        expect(responseCoconut.statusCode).toBe(404);
    });
});
// // end


/** DELETE invoices */

describe("DELETE /companies/:code", async function () {
    test("Deletes a single a company", async function () {
        const response = await request(app)
            .delete(`/companies/${company.code}`);
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({ "status": "deleted" });
    });
});
// // end

