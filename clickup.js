import markdown from "./markdown.js";
import axios from "axios";
import fs from "fs";
import moment from "moment";
import { stringify } from "flatted";
import { task_references } from "./db/models/task_emails.js";
import { default as d } from "debug";

const debug = d("dev");
const date = moment().format("YYYY-MM-DD_HH-mm-ss.x");

const create_task = async (config, from, body) => {
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

    return axios
        .post(
            `https://api.clickup.com/api/v2/list/${config.clickup.list}/task`,
            data,
            {
                headers: { Authorization: `${config.clickup.token}` },
            }
        )
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

const comment_task = async function (task_id, config, body) {
    let data = {};

    if (body.html !== null) {
        data.comment_text = body.html
            .trim()
            .replace(/<[^>]*>?/gm, "")
            .trim();
    } else if (body.plain !== null) {
        data.comment_text = body.plain.trim();
    } else {
        return false;
    }

    return axios
        .post(`https://api.clickup.com/api/v2/task/${task_id}/comment`, data, {
            headers: { Authorization: `${config.clickup.token}` },
        })
        .then(({ data }) => {
            const { message_id, references } = body.headers;
            let r =
                typeof references === "undefined" ? [] : references.split(" ");

            fs.writeFileSync(
                `success/comment.${date}.json`,
                JSON.stringify({ id: task_id, data })
            );

            try {
                task_references(r, { id: task_id });
            } catch (e) {}

            return data;
        })
        .catch((error) => {
            console.error(error.stack);
            fs.writeFileSync(`error/comment.${date}.json`, stringify(error));
            return false;
        });
};

export { create_task, comment_task };
