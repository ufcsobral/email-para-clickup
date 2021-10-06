import Sequelize from "sequelize";
import database from "../database.js";
import connection from "../connection.js";

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
    await connection();

    return model.bulkCreate(
        references.map((id) => ({
            task_id: data.id,
            email_id: id,
        }))
    );
};

export { task_references };
export default model;
