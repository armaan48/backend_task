const express = require("express");
const { Pool } = require("pg");
const process = require("process");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASS,
    port: process.env.DB_PORT,
    ssl: true,
});

app.use(express.json());

app.post("/identify", async (req, res) => {
    const { email, phoneNumber } = req.body;
    const client = await pool.connect();

    client.query("BEGIN");

    try {
        const { rows: exactMatch } = await client.query(
            "SELECT id, linkedId FROM contacts WHERE email = $1 AND phoneNumber = $2",
            [email, phoneNumber]
        );

        if (exactMatch.length == 0) {
            await client.query(
                "INSERT INTO contacts (email, phoneNumber, linkPrecedence) VALUES ($1, $2, $3)",
                [email, phoneNumber, "primary"]
            );
        }

        const { rows: newEntry } = await client.query(
            "SELECT id FROM contacts WHERE email = $1 AND phoneNumber = $2",
            [email, phoneNumber]
        );

        const newEntryId = newEntry[0].id;
        const { rows: emailMatches } = await client.query(
            "SELECT id  FROM contacts WHERE email = $1 AND id != $2 limit 1",
            [email, newEntryId]
        );
        const { rows: phoneNumberMatches } = await client.query(
            "SELECT id FROM contacts WHERE phoneNumber = $1 AND id != $2 limit 1",
            [phoneNumber, newEntryId]
        );

        if (emailMatches.length) {
            console.log(`Email merge => ${emailMatches[0].email}`);
            await client.query("SELECT union_contacts_optimized($1, $2)", [
                newEntryId,
                emailMatches[0].id,
            ]);
        }
        if (phoneNumberMatches.length) {
            console.log(`Phone merge => ${phoneNumberMatches[0].email}`);
            await client.query("SELECT union_contacts_optimized($1, $2)", [
                newEntryId,
                phoneNumberMatches[0].id,
            ]);
        }

        const { rows: primaryContactRows } = await client.query(
            "SELECT find_contact_optimized($1)",
            [newEntryId]
        );

        const primaryContactId = primaryContactRows[0].find_contact_optimized;

        const { rows: finalContacts } = await client.query(
            `SELECT id,email, phoneNumber as "phoneNumber" FROM contacts WHERE find_contact_optimized(id) = $1`,
            [primaryContactId]
        );

        const emails = new Set();
        const phoneNumbers = new Set();
        const secondaryContactIds = [];

        finalContacts.forEach((contact) => {
            emails.add(contact.email);
            phoneNumbers.add(contact.phoneNumber);
            if (contact.id != primaryContactId)
                secondaryContactIds.push(contact.id);
        });

        await client.query("COMMIT");

        res.json({
            primaryContactId,
            emails: Array.from(emails),
            phoneNumbers: Array.from(phoneNumbers),
            secondaryContactIds,
        });
    } catch (error) {
        await client.query("ROLLBACK");
        res.status(500).json({ error: "Internal server error" });
    } finally {
        client.release();
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
