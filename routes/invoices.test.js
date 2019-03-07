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

describe("GET /invoices", async function () {
    test("Gets a list of invoices", async function () {
        const response = await request(app).get(`/invoices`);
        const { invoices } = response.body;
        expect(response.statusCode).toBe(200);
        expect(invoices).toHaveLength(1);
    });
});
// end


/** GET /items/[name] - return data about one item: `{item: item}` */

describe("GET /invoices/:id", async function () {
    test("Gets a single invoice", async function () {
        const response = await request(app).get(`/invoices/${invoice.id}`);
        expect(response.statusCode).toBe(200);
        expect(response.body.invoice.id).toEqual(invoice.id);
    });

    test("Responds with 404 if can't find item", async function () {
        const response = await request(app).get(`/invoices/999`);
        expect(response.statusCode).toBe(404);
        const responseCoconut = await request(app).get(`/invoices/coconut`);
        expect(responseCoconut.statusCode).toBe(404);
        
    });
});
// end


/** POST /items - create item from data; return `{item: item}` */

describe("POST /invoices", async function () {
    test("Creates a new invoice", async function () {
        const response = await request(app)
            .post(`/invoices`)
            .send({
                "comp_code": "test_company",
                "amt": 99
            });
        expect(response.statusCode).toBe(200);
        expect(response.body.invoice).toHaveProperty("comp_code");
        expect(response.body.invoice).toHaveProperty("id");
        expect(response.body.invoice).toHaveProperty("amt");
        expect(response.body.invoice).toHaveProperty("paid");
        expect(response.body.invoice).toHaveProperty("add_date");
        expect(response.body.invoice).toHaveProperty("paid_date");
        expect(response.body.invoice.comp_code).toEqual("test_company");
        expect(response.body.invoice.amt).toEqual(99);
    });
});
// end


// /** PATCH /items/[name] - update item; return `{item: item}` */

// describe("PATCH /items/:name", async function () {
//     test("Updates a single item", async function () {
//         const response = await request(app)
//             .patch(`/items/${item.name}`)
//             .send({
//                 name: "Troll"
//             });
//         expect(response.statusCode).toBe(200);
//         expect(response.body.item).toEqual({
//             name: "Troll"
//         });
//     });

//     test("Responds with 404 if can't find item", async function () {
//         const response = await request(app).patch(`/items/0`);
//         expect(response.statusCode).toBe(404);
//     });
// });
// // end


// /** DELETE /items/[name] - delete item, 
//  *  return `{message: "item deleted"}` */

// describe("DELETE /items/:name", async function () {
//     test("Deletes a single a item", async function () {
//         const response = await request(app)
//             .delete(`/items/${item.name}`);
//         expect(response.statusCode).toBe(200);
//         expect(response.body).toEqual({ message: "Deleted" });
//     });
// });
// // end

