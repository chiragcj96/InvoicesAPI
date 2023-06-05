const express = require('express');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
app.use(express.json());

// connection pool to the PostgreSQL database
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD
});

// POST /invoices: Create invoice
app.post('/invoices', async (req, res) => {
  try {
    const { customerId, amount, dueDate, items } = req.body;
    const client = await pool.connect();

    await client.query('BEGIN');                                    // Start a transaction

    // Insert invoice record into the database
    const invoiceQuery = `
      INSERT INTO invoices (customer_id, amount, due_date)
      VALUES ($1, $2, $3)
      RETURNING id
    `;
    const invoiceValues = [customerId, amount, dueDate];
    const invoiceResult = await client.query(invoiceQuery, invoiceValues);
    const invoiceId = invoiceResult.rows[0].id;

    // Insert invoice items into the database
    const itemQuery = `
      INSERT INTO invoice_items (invoice_id, description, cost, quantity)
      VALUES ($1, $2, $3, $4)
    `;
    for (const item of items) {
      const itemValues = [invoiceId, item.description, item.cost, item.quantity];
      await client.query(itemQuery, itemValues);
    }

    await client.query('COMMIT');                                           // Committing the transaction
    client.release();

    res.status(201).json({ message: 'Invoice creation successful' });
  } catch (error) {
    await client.query('ROLLBACK');                                         // Rollback transaction if an error
    client.release();

    console.error(error);
    res.status(500).json({ error: 'Error occurred' });
  }
});

// GET /invoices: Get the list of all invoices
app.get('/invoices', async (req, res) => {
  try {
    const client = await pool.connect();

    const query = 'SELECT * FROM invoices';                             // Retrieve all * invoices from the database
    const result = await client.query(query);
    const invoices = result.rows;
    client.release();

    res.json(invoices);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error occurred' });
  }
});

// app.get('/', async (req, res) => {
//     res.render('default.htm');
//   });

// GET /invoices/:id: Get a specific invoice by id
app.get('/invoices/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const client = await pool.connect();

    const query = 'SELECT * FROM invoices WHERE id = $1';                       // Retrieve the invoice from the database by id
    const result = await client.query(query, [id]);
    const invoice = result.rows[0];

    const itemQuery = 'SELECT * FROM invoice_items WHERE invoice_id = $1';          // Retrieve invoice items from the database
    const itemResult = await client.query(itemQuery, [id]);
    const items = itemResult.rows;
    invoice.items = items;

    client.release();
    if (invoice) {
      res.json(invoice);
    } else {
      res.status(404).json({ error: 'Invoice not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error occurred' });
  }
});

// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
