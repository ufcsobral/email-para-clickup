import markdown from "./markdown.js";
import axios from "axios";
import fs from "fs";
import moment from "moment";
import { stringify } from "flatted";
import { task_references } from "./db/models/task_emails.js";

const api_token = process.env.API_TOKEN;
const list_id = process.env.LIST_ID;

const create_task = async (body) => {
    const { from, subject, message_id, references } = body.headers;

    /* Converte o HTML para MarkDown */
    let data = { markdown_description: markdown(body.html ?? body.plain) };
    data.markdown_description =
        `# ${from} enviou\n\n` + `${data.markdown_description}\n\n---`;

    data.name = subject.replace(/^(Fwd|Enc|Re)\:/i, "").trim();
    data.custom_fields = [{ id: "message_id", value: message_id }];

    const date = moment().format("YYYY-MM-DD_HH-mm-ss.x");

    return axios
        .post(`https://api.clickup.com/api/v2/list/${list_id}/task`, data, {
            headers: { Authorization: `${api_token}` },
        })
        .then(({ data }) => {
            let r = references.split(" ");
            r.push(message_id);
            
            task_references(r, data);
            fs.writeFileSync(`success/${date}.json`, JSON.stringify(data));
        })
        .catch((error) => {
            console.error(error.stack);

            fs.writeFileSync(`error/${date}.json`, stringify(error));
        });
};

export { create_task };
