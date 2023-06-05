# InvoicesAPI
API to create invoices and retrieve them
Initialize a new Node.js project using npm init.

Run the server using node server.js.

You can send requests to http://localhost:3000/invoices to create new invoices, retrieve the list of invoices, and get specific invoices by their IDs.


you can set up a .env file in the root directory and add following config for PostgreSQL DB.
```
DB_HOST=your_database_host
DB_PORT=your_database_port
DB_NAME=your_database_name
DB_USER=your_database_username
DB_PASSWORD=your_database_password
```


The dB will look like this with following tables:
```
CREATE TABLE invoices (
  id SERIAL PRIMARY KEY,
  customer_id VARCHAR(255) NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  due_date DATE NOT NULL
);

CREATE TABLE invoice_items (
  id SERIAL PRIMARY KEY,
  invoice_id INTEGER REFERENCES invoices(id),
  description VARCHAR(255) NOT NULL,
  cost NUMERIC(10, 2) NOT NULL,
  quantity INTEGER NOT NULL
);
```
