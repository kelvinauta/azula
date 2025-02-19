class SplitterText {
  _cleanText(text) {
    return text
      .replace(/\s+/g, ' ')
      .replace(/\n+/g, '\n')
      .trim();
  }

  word(text) {
    const cleanedText = this._cleanText(text);
    const words = cleanedText.split(/[\s\n]+/);
    return words.map(word => ({ text: word, separator: ' ' }));
  }

  segments(text) {
    const cleanedText = this._cleanText(text);
    const segments = cleanedText.split(/([.!?]+)/).filter(Boolean);
    const result = [];
    for (let i = 0; i < segments.length; i += 2) {
      result.push({
        text: segments[i],
        separator: segments[i + 1] || ''
      });
    }
    return result;
  }

  paragraph(text) {
    const cleanedText = this._cleanText(text);
    const paragraphs = cleanedText.split('\n');
    return paragraphs.map(paragraph => ({ text: paragraph, separator: '\n' }));
  }
}

export default SplitterText;
