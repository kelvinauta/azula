import { stringify } from "uuid";

const Mustache = require("mustache");
const { z } = require("zod");
function builder_webhooks(webhook_template, template_data) {
    const keys_templates = ["url", "headers", "body"];
    const keys_json_parsed = ["headers", "body"];
    const keys_static = ["method"];

    // HACK to FUCKING JSON PARSE
    template_data.real_answer = template_data.answer;
    template_data.answer = "answer";

    let webhook_parsed = {};

    keys_templates.forEach((key) => {
        const result = Mustache.render(webhook_template[key], template_data);
        webhook_parsed[key] = result;
    });

    keys_json_parsed.forEach((key) => {
        webhook_parsed[key] = JSON.parse(webhook_parsed[key]);
    });

    // CONTINUE the HACK
    function replaceRecursive({ obj, searchValue, replaceValue, maxDepth = 10, currentDepth = 0 }) {
        if (currentDepth >= maxDepth || obj === null) return;

        if (Array.isArray(obj)) {
            obj.forEach((item) =>
                replaceRecursive({
                    obj: item,
                    searchValue,
                    replaceValue,
                    maxDepth,
                    currentDepth: currentDepth + 1,
                })
            );
        } else if (typeof obj === "object") {
            Object.entries(obj).forEach(([key, value]) => {
                if (value === searchValue) {
                    obj[key] = replaceValue;
                } else if (value && typeof value === "object") {
                    replaceRecursive({
                        obj: value,
                        searchValue,
                        replaceValue,
                        maxDepth,
                        currentDepth: currentDepth + 1,
                    });
                }
            });
        }
    }

    replaceRecursive({
        obj: webhook_parsed,
        searchValue: template_data.answer,
        replaceValue: template_data.real_answer,
    });

    keys_static.forEach((key) => {
        webhook_parsed[key] = webhook_template[key];
    });
    return webhook_parsed;
}

export default { builder_webhooks };
