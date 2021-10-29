import markdown from "./markdown.js";
import axios from "axios";
import fs from "fs";
import moment from "moment";
import { stringify } from "flatted";
import { task_references } from "./db/models/task_emails.js";
import { default as d } from "debug";

const debug = d("dev");

const api_token = process.env.API_TOKEN;
const list_id = process.env.LIST_ID;

const create_task = async (from, body) => {
    const { subject, message_id, references } = body.headers;

    /* Converte o HTML para MarkDown */
    let data = {};
    data.markdown_description = `# ${from} enviou\n\n`;

    if (body.html !== null) {
        const html = markdown(body.html.trim());
        data.markdown_description = `${data.markdown_description}${html}`;
    } else if (body.plain !== null) {
        const plain = body.plain.trim();
        data.markdown_description = `${data.markdown_description}${plain}`;
    } else {
        return false;
    }

    debug(data.markdown_description);

    data.markdown_description = `${data.markdown_description}\n\n---`;

    data.name = subject.replace(/^(Fwd|Enc|Re)\:/i, "").trim();
    data.custom_fields = [{ id: "message_id", value: message_id }];

    if (process.env.NODE_ENV !== "production") {
        data.name = `[${process.env.NODE_ENV}] ${data.name}`;
    }

    const date = moment().format("YYYY-MM-DD_HH-mm-ss.x");

    return axios
        .post(`https://api.clickup.com/api/v2/list/${list_id}/task`, data, {
            headers: { Authorization: `${api_token}` },
        })
        .then(({ data }) => {
            let r = [];

            if (typeof references === "undefined") {
                r = [message_id];
            } else {
                r = references.split(" ");
                r.push(message_id);
            }

            fs.writeFileSync(`success/${date}.json`, JSON.stringify(data));
            task_references(r, data);
            return data;
        })
        .catch((error) => {
            console.error(error.stack);

            fs.writeFileSync(`error/${date}.json`, stringify(error));

            return false;
        });
};

export { create_task };
