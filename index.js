import express from "express";
import bodyParser from "body-parser";
import fs from "fs";
import moment from "moment";
import { stringify } from "flatted";
import { create_task } from "./clickup.js";
import db from "./db/connection.js";
import task_emails from "./db/models/task_emails.js";

const app = express();

app.use(bodyParser.json({ limit: "50mb" }));

app.post("/:to", async (req, res) => {
    // console.log(req.body);
    const date = moment().format("YYYY-MM-DD_HH-mm-ss.x");
    fs.writeFileSync(`debug/mail.${date}.json`, JSON.stringify(req.body));
    // return;

    const ignored = JSON.parse(fs.readFileSync("ignore-from.json", "utf8"));
    const ignored_file = `${req.params.to}.ignore-from.json`;

    if (fs.existsSync(ignored_file)) {
        // const also_ignore = JSON.parse(fs.readFileSync(ignored_file, "utf8"));
        ignored.push(...JSON.parse(fs.readFileSync(ignored_file, "utf8")));
    }
    console.log(ignored_file, fs.existsSync(ignored_file), ignored);

    const from = req.body.headers.from.match(/[^< ]+(?=>)/);

    if (!ignored.includes(from[0])) {
        const { message_id } = req.body.headers;

        await db();
        const task = await task_emails.findByPk(message_id);

        if (task === null) {
            console.log("Tarefa ainda não criada");
            const clickup = await create_task(from, req.body);

            if (clickup !== false) {
                const r = `Tarefa criada: https://app.clickup.com/t/${clickup.id}`;
                console.log(r);
                res.send(r);
            } else {
                res.send(
                    "Houve um erro ao criar a tarefa. " +
                        `Consulte o log error/${date}.json`
                );
            }
        } else {
            const r = `Tarefa já existe: https://app.clickup.com/t/${task.task_id}`;
            console.log(r);
            res.send(r);
        }
    } else {
        const r = [
            `E-mail de ${from} ignorado.`,
            `Assunto do e-mail ignorado: ${req.body.headers.subject}`,
        ];
        r.forEach((d) => console.log(d));
        res.send(r.join("\n"));
    }
});

app.listen("80", "0.0.0.0", () => {
    console.log("server started");
});
