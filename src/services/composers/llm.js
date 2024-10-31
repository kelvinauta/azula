
class LLM { // interface
    info(){
        console.log('LLM info')
        throw new Error('Method not implemented')
    }
    set_config(){
        console.log('LLM config')
        throw new Error('Method not implemented')
    }
    check(){
        console.log('LLM check')
        throw new Error('Method not implemented')
    }
    run(){
        console.log('LLM run')
        throw new Error('Method not implemented')
    }
}

export default LLM