import { stringify } from "uuid";

const Mustache = require("mustache");
const { z } = require("zod");
function builder_webhooks(webhook_template, template_data) {
    const keys_templates = ["url", "headers", "body"];
    const keys_json_parsed = ["headers", "body"];
    const keys_static = ["method"];
    let webhook_parsed = {};

    keys_templates.forEach((key) => {
        const result = Mustache.render(webhook_template[key], template_data);
        webhook_parsed[key] = result;
    });

    keys_json_parsed.forEach((key) => {
        webhook_parsed[key] = JSON.parse(webhook_parsed[key]);
    });

    keys_static.forEach((key) => {
        webhook_parsed[key] = webhook_template[key];
    });
    return webhook_parsed;
}

export default { builder_webhooks };
