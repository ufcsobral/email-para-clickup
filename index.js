import fs from "fs";
import clickup from "./clickup.js";

const mail = JSON.parse(fs.readFileSync('debug/212021-09-22_18-40-50.1632336050249.json', 'utf8'));

clickup(mail);
