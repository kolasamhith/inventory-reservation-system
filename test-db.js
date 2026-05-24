const { Client } = require("pg");

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function test() {
  try {
    await client.connect();
    console.log("Connected successfully!");
    await client.end();
  } catch (err) {
    console.error(err);
  }
}

test();