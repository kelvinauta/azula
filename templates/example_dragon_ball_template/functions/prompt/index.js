export default {
    now: () => {
        return new Date().toLocaleString();

        // Input:
        // This is the actual time: {{/now}}

        // Output:
        // This is the actual time: 01/01/2025, 22:30:47
    },
    context: (args) => {
        const {
            message, // Message of user
            history, // Array of messages, history conversation
            agent, // WARN: agent data include api_key
            context, // Context of conversation (human, channel)
        } = args; // This is all args
        return JSON.stringify(args.context, null, 2); // IMPORTANT return string
    },
    calculator: (args, custom_args) => {
        // custom_args is a array of simple args
        return custom_args.reduce((a, b) => parseInt(a) + parseInt(b));

        // Input:
        // What is 1+2+3+4+5? Answer: {{/calculator(1,2,3,4,5)}}

        // Output:
        // What is 1+2+3+4+5? Answer: 15
    },
};
