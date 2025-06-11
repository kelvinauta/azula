// Security Note:
// although the functions in the prompt/ and
// messages/ directories work the same, you
// normally wouldn’t want the user to be able to
// call certain functions. for example, in an
// e-commerce context it makes sense for a prompt
// function to be {{/most_sale_products}} and for
// this function to make an http request to fetch
// the top-selling products so that the llm agent
// has this information. however, it’s not very
// useful for the user to execute this function,
// not to mention the potential abuse by a user
// who runs it over and over again
// {{/most_sale_products}} {{/most_sale_products}}
// {{/most_sale_products}}… etc., since it
// executes every time it appears.  

// This is more useful for advanced users who, to begin with, are aware of this functionality.

export default {
    now: () => {
        return new Date().toLocaleString();

        // Input:
        // This is the actual time: {{/now}}

        // Output:
        // This is the actual time: 01/01/2025, 22:30:47
    },
};
