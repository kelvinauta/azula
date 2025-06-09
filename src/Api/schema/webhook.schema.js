import { z } from "zod";
export const webhookSchema = z.object({
    method: z.enum(["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"]).default("POST"),
    body: z.string().refine(
        (val) => {
            try {
                JSON.parse(val);
                return true;
            } catch {
                return false;
            }
        },
        {
            message: "body debe ser un JSON válido en forma de string",
        }
    ),
    headers: z.string().refine(
        (val) => {
            try {
                JSON.parse(val);
                return true;
            } catch {
                return false;
            }
        },
        {
            message: "headers debe ser un JSON válido en forma de string",
        }
    ),
    url: z.string(),
    event_listener: z.object({
        answer: z.boolean().default(true),
    }),
    agent_id: z.string(),
});
