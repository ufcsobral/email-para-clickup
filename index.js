import express from "express";
import bodyParser from "body-parser";
import fs from "fs";
// import moment from "moment";
import { create_task } from "./clickup.js";
import db from "./db/connection.js";
import task_emails from "./db/models/task_emails.js";

const app = express();

app.use(bodyParser.json({ limit: "50mb" }));

app.post("/", async (req, res) => {
    // console.log(req.body);
    // let date = moment().format('YYY-MM-DD_HH-mm-ss.x');
    // fs.writeFileSync(`${date}.json`, JSON.stringify(req.body));

    const from = JSON.parse(fs.readFileSync("ignore-from.json", "utf8"));

    if (!from.includes(req.body.envelope.from)) {
        const { message_id } = req.body.headers;

        await db();
        const task = await task_emails.findByPk(message_id);

        if (task === null) {
            console.log('tarefa ainda não criada');
            await create_task(req.body);
        } else {
            console.log('tarefa já existe');
        }
    }

    res.send("Thanks!");
});

app.listen("80", "0.0.0.0", () => {
    console.log("server started");
});
