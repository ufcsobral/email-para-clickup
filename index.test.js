import glob from "glob";
import { default as d } from "debug";
import fs from "fs";
import { create_task } from "./clickup.js";

const debug = d("dev");
const posts = glob.sync("debug/mail.*.json");
const rand = Math.floor(Math.random() * posts.length);

const mail = JSON.parse(fs.readFileSync(posts[rand]), "utf8");
const from = mail.headers.from.match(/[^< ]+(?=>)/);

debug("%O", posts[rand]);

await create_task(from, mail);
