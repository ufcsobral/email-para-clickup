import markdown from "./markdown.js";
import axios from "axios";
import fs from "fs";
import moment from "moment";

const api_token = process.env.API_TOKEN;
const list_id = process.env.LIST_ID;

const create_task = async (body) => {
    /* Converte o HTML para MarkDown */
    let data = { markdown_description: markdown(body.html) };
    data.markdown_description =
        `# ${body.headers.from} enviou\n\n` +
        `${data.markdown_description}\n\n---`;

    data.name = body.headers.subject.replace(/^(Fwd|Enc|Re)\:/i, "").trim();
    data.custom_fields = [{ id: "message_id", value: body.headers.message_id }];

    return axios
        .post(`https://api.clickup.com/api/v2/list/${list_id}/task`, data, {
            headers: { Authorization: `${api_token}` },
        })
        .then((response) => {
            const date = moment().format("YYY-MM-DD_HH-mm-ss.x");
            fs.writeFileSync(`success/${date}.json`, JSON.stringify(response));
        })
        .catch((error) => {
            console.error(error.stack);

            const date = moment().format("YYY-MM-DD_HH-mm-ss.x");
            fs.writeFileSync(`error/${date}.json`, JSON.stringify(error));
        });
};

export { create_task };
