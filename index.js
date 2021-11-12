import express from "express";
import bodyParser from "body-parser";
import fs from "fs";
import moment from "moment";
import { create_task, comment_task } from "./clickup.js";
import db from "./db/connection.js";
import task_emails from "./db/models/task_emails.js";
import YAML from "yaml";
import { default as d } from "debug";

const debug = d("index");
const app = express();

app.use(bodyParser.json({ limit: "50mb" }));

app.post("/:to", async (req, res) => {
    // console.log(req.body);
    const date = moment().format("YYYY-MM-DD_HH-mm-ss.x");
    fs.writeFileSync(`debug/mail.${date}.json`, JSON.stringify(req.body));

    const config_file = `config.${req.params.to}.yml`;
    let config = [];

    if (fs.existsSync(config_file)) {
        config = YAML.parse(fs.readFileSync(config_file, "utf8"));
    } else {
        const r =
            `Não existe configuração para "${req.params.to}". ` +
            `Crie o arquivo confg.${req.params.to}.yml`;
        console.log(r);
        res.send(r);
        return;
    }
    debug(config_file, fs.existsSync(config_file), config);

    const from = req.body.headers.from.match(/[^< ]+(?=>)/);
    const { message_id } = req.body.headers;

    await db();
    const task = await task_emails.findByPk(message_id);

    if (task === null) {
        if (!config.ignore.includes(from[0])) {
            debug("Tarefa ainda não criada");
            const clickup = await create_task(config, from, req.body);

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
            const r = [
                `E-mail de ${from} ignorado.`,
                `Assunto do e-mail ignorado: ${req.body.headers.subject}`,
            ];
            r.forEach((d) => debug(d));
            res.send(r.join("\n"));
        }
    } else {
        const r = `Tarefa já existe: https://app.clickup.com/t/${task.task_id}`;
        debug(r);
        res.send(await comment_task(task.task_id, config, req.body));
    }
});

app.listen("80", "0.0.0.0", () => {
    debug("server started");
});
