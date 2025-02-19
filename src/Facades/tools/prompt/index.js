export default {
    now: ()=>{
        return new Date().toLocaleString();
    },
    context: (args)=>{
        return JSON.stringify(args.context, null, 2)
    }
}
