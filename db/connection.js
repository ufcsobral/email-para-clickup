import database from "./database.js";
import moment from "moment";
import fs from "fs";
import { stringify } from "flatted";
const dir = process.env.WORKING_DIR

export default async () => {
    const date = moment().format("YYYY-MM-DD_HH-mm-ss.x");
    try {
        const resultado = await database.sync();
        console.log(resultado);

        fs.writeFileSync(`${dir}/debug/${date}.json`, JSON.stringify(resultado));

        return resultado;
    } catch (error) {
        console.error(error.stack);

        fs.writeFileSync(`${dir}/error/${date}.json`, JSON.stringify(error));
    }
};
