import express from "express";
import bodyParser from "body-parser";
import fs from "fs";
// import moment from "moment";
import clickup from "./clickup";

const app = express();

app.use(bodyParser.json({ limit: "50mb" }));

app.post("/", (req, res) => {
    // console.log(req.body);
    // let date = moment().format('YYY-MM-DD_HH-mm-ss.x');
    // fs.writeFileSync(`${date}.json`, JSON.stringify(req.body));

    const from = JSON.parse(fs.readFileSync("ignore-from.json", "utf8"));

    if (!from.includes(req.body.envelope.from)) {
        const task = await clickup(req.body);
    }

    res.send("Thanks!");
});

app.listen("80", "0.0.0.0", () => {
    console.log("server started http://0.0.0.0:80");
});
