import express from "express";
import bodyParser from "body-parser";
import fs from "fs";
import moment from "moment";
import { create_task } from "./clickup.js";
import db from "./db/connection.js";
import task_emails from "./db/models/task_emails.js";

const app = express();

app.use(bodyParser.json({ limit: "50mb" }));

app.post("/", async (req, res) => {
    // console.log(req.body);
    const date = moment().format("YYYY-MM-DD_HH-mm-ss.x");
    fs.writeFileSync(`debug/${date}.json`, JSON.stringify(req.body));

    const ignored = JSON.parse(fs.readFileSync("ignore-from.json", "utf8"));

    const from = req.body.headers.from.match(/[^< ]+(?=>)/);

    if (!ignored.includes(from[0])) {
        const { message_id } = req.body.headers;

        await db();
        const task = await task_emails.findByPk(message_id);

        if (task === null) {
            console.log("Tarefa ainda não criada");
            await create_task(req.body);
        } else {
            console.log("Tarefa já existe");
        }
    } else {
        console.log(`E-mail de ${req.body.envelope.from} ignorado`);
        console.log(`Assunto: ${req.body.headers.subject}`);
    }

    res.send("Thanks!");
});

app.listen("80", "0.0.0.0", () => {
    console.log("server started");
});
