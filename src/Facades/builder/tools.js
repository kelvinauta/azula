import Cli from "../../Cli";
import get_template from "../../Start/get_template";
import { z } from "zod";
function builder_tools(tools_of_agent) {
    return tools_of_agent.map((tool) => _builder_tool(tool));
}

function _builder_tool({ id, name, description, mode, source, dependencies, parameters, Http }) {
    let tool = {
        name,
        description,
        parameters,
        execute: _build_execute({ mode, source, dependencies, parameters, Http }),
    };
    return tool;
}
function _build_execute({ mode, source, dependencies, parameters, Http }) {
    if (mode === "http") {
        return _build_mode_http(parameters, Http);
    }
    if (mode === "source") {
        throw new Error("source mode not implemented yet");
    }
    throw new Error(`mode is ${mode} and must by enum[http,source]`);
}
function _build_mode_http(
    parameters,
    { method, url, data_mode, body_static, params_static, headers_static, timeout }
) {
    async function request_http(params_by_llm) {
        let _url = url;
        let _method = method;
        let _body = body_static ? { ...body_static } : {};
        let _params = params_static ? { ...params_static } : {};
        let _headers = headers_static ? { ...headers_static } : {};
        if (data_mode === "body") {
            _body = { ..._body, ...params_by_llm };
        }
        if (data_mode === "params") {
            _params = { ..._params, ...params_by_llm };
        }
        const _params_string = new URLSearchParams(_params).toString() || "";
        _url += _params_string ? "?" + _params_string : "";
        let fetch_options = { method: _method };
        if (Object.keys(_headers).length) fetch_options.headers = _headers;
        if (Object.keys(_body).length) fetch_options.body = _body;
        console.dir({ _url, fetch_options }, { depth: null });
        const result = await fetch(_url, {
            ...fetch_options,
        });
        return await result.json();
    }
    return request_http;
}

const default_tools = {};

let agent_tools = builder_tools;
let system_tools = default_tools;
let message_tools = default_tools;

if (Cli.functions) {
    // get from $TEMPLATE_DIR/functions
    try {
        const { functions } = await get_template();
        system_tools = {
            ...system_tools,
            ...functions.prompt,
        };
        message_tools = {
            ...message_tools,
            ...functions.messages,
        };
        agent_tools = (tools) => {
            const normal_tools = builder_tools(tools);
            let template_tools = functions.ai;
            return [...normal_tools, ...template_tools];
        };
    } catch (error) {
        console.warn(error.message);
    }
}
export default { agent_tools, system_tools, message_tools };
