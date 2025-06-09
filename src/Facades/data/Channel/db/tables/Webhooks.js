import _Table from "./_Table.js"
import { DataTypes } from "sequelize"
import { z } from "zod";

class Webhooks extends _Table {
    static attributes = {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false,
            primaryKey: true,
        },
        method: {
            type:DataTypes.ENUM("GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"),
            default:"POST",
            allowNull: false,
        },
        body: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        headers: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        url: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        event_listener: {
            type: DataTypes.JSON,
            allowNull: false,
            defaultValue: {
                answer: true,
            },
        },
    };

    static schema = z.object({
        id:z.string().uuid().optional(),
        method: z.string(),
        body: z.string().refine((val) => {
            try {
              JSON.parse(val);
              return true;
            } catch {
              return false;
            }
          }, {
            message: "body debe ser un JSON válido en forma de string",
          }),
          headers: z.string().refine((val) => {
            try {
              JSON.parse(val);
              return true;
            } catch {
              return false;
            }
          }, {
            message: "headers debe ser un JSON válido en forma de string",
          }),
        url: z.string(),
        event_listener: z.object({
            answer: z.boolean().default(true),
        }),
    })

    constructor(...all) {
        super(...all);
    }
}

export default Webhooks;
