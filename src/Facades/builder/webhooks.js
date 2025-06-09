const Mustache = require("mustache");
const { z } = require("zod");
// webhookData = contenido de DataValues
// keys_templates:[str]= [url. headers, body]
// keys_json_parsed = [headers, body]
// webhook_parsed={} este es un webhook ya procesado con objetos en vez de string
// for keys_templates: webhook_parsed[key] = Mustache.render(webook_crudo[key], templateData)]
// for keys_json_parsed = webhook_parsed[key] = JSON.parse(webhook_parsed[key])
function builder_webhooks(webhookData, templateData) {
    const keys_templates = ["url", "headers", "body"];
    const keys_json_parsed = ["headers", "body"];

    let webhook_parsed = {};

    keys_templates.forEach((key) => {
        const stringified = JSON.stringify(webhookData[key]);
        const rendered = Mustache.render(stringified, templateData);
        webhook_parsed[key] = JSON.parse(rendered);
    });

    keys_json_parsed.forEach((key) => {
        keys_templates[key] = keys_templates[key];
    });
    console.log("Final webhook_parsed:", webhook_parsed);

    return webhook_parsed;
}

export default { builder_webhooks };
