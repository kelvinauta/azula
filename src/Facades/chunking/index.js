importder>f EmbeddingEngine from "./embedding_engine";
import SplitterText from "./splitter_text";
class Chunking {
    constructor() {
        const embeddingEngine = new EmbeddingEngine();
        this.create_embedding = embeddingEngine.set_open_ai(
            process.env.OPENAI_API_KEY,
        );
        this.separators = ".";
        this.splitter = new SplitterText();
    }
    split({
        text_input,
        text_splitting = "",
        separator_level = 2,
        min_chunk_size,
    }) {
        let new_chunks = []
        let chunk_index = 0
        let result = text_splitting;
        if (separator_level < 0) return result;
        const separators = ["word", "segments", "paragraph"];
        const separator = separators[separator_level];
        const chunks = this.splitter[separator](text_input).map(
            ({ text }) => text,
        );
        for (const chunk of chunks) {
            const length = (result + chunk).length;
            if (length < min_chunk_size) {
                result += chunk;
                continue;
            }
            if (length > min_chunk_size) {
                return this.split({
                    text_input: chunk,
                    text_splitting: result,
                    separator_level: separator_level - 1,
                    min_chunk_size,
                });
            }
        }
    }
}

export default Chunking;
