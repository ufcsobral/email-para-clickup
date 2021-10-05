import express from "express";
import bodyParser from "body-parser";
import fs from "fs";
// import moment from "moment";
import { create_task } from "./clickup.js";

const app = express();

app.use(bodyParser.json({ limit: "50mb" }));

app.post("/", async (req, res) => {
    // console.log(req.body);
    // let date = moment().format('YYY-MM-DD_HH-mm-ss.x');
    // fs.writeFileSync(`${date}.json`, JSON.stringify(req.body));

    const from = JSON.parse(fs.readFileSync("ignore-from.json", "utf8"));

    if (!from.includes(req.body.envelope.from)) {
        const clickup = await create_task(req.body);
    }

    res.send("Thanks!");
});

app.listen("80", "0.0.0.0", () => {
    console.log("server started");
});
