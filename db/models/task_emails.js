import Sequelize from "sequelize";
import database from "../database.js";
import connection from "../connection.js";
import { default as d } from "debug";
const debug = d("dev");

const model = database.define("Task has e-mail", {
    task_id: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    email_id: {
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true,
    },
});

const task_references = async (references, data) => {
    debug("associando tarefa ao e-mail");
    debug(
        "E-mails: %O",
        references.map((r) => {
            return { value: r, length: r.length };
        })
    );
    debug("Tarefa: %o", data);

    await connection();

    const results = await Promise.all(references.map((v) => model.findByPk(v)));
    references = references.filter((v, k) => results[k] === null);

    try {
        return model.bulkCreate(
            references.map((id) => ({
                task_id: data.id,
                email_id: id,
            }))
        );
    } catch (e) {
        console.error(e);
    }
};

export { task_references };
export default model;
