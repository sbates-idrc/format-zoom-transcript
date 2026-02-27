export class ZoomTranscriptFormatter {
	// Configuration
	#writer;
	// Regular expression for matching a timestamp line
	#timestampRe = /^\[([^\]]+)\]\s+\d\d:\d\d:\d\d$/;
	// State
	#previousSpeakerName = '';
	#isFirstSpeaker = true;
	#currentParagraphText = '';

	constructor(writer) {
		this.#writer = writer;
	}

	line(line) {
		const matches = line.match(this.#timestampRe);
		if (matches) {
			this.#handleTimestamp(matches[1], line);
		} else if (line !== '') {
			this.#handleText(line);
		}
	}

	end() {
		// Write the current paragraph, if we have one
		if (this.#currentParagraphText !== '') {
			this.#writer.writeParagraph(this.#currentParagraphText);
		}

		this.#writer.end();
	}

	#handleTimestamp(name, text) {
		if (this.#isFirstSpeaker || name !== this.#previousSpeakerName) {
			// We have changed speakers (or it's the first speaker)

			// Write the current paragraph, if we have one
			// And start a new paragraph
			if (this.#currentParagraphText !== '') {
				this.#writer.writeParagraph(this.#currentParagraphText);
				this.#currentParagraphText = '';
			}

			// Write the timestamp
			this.#writer.writeTimestamp(text);

			// Set the formatter state for the new speaker
			this.#previousSpeakerName = name;
			this.#isFirstSpeaker = false;
		}
	}

	#handleText(text) {
		if (this.#currentParagraphText !== '') {
			// Separate text within a paragraph by a space
			this.#currentParagraphText += ' ';
		}

		this.#currentParagraphText += text;

		// If the text does not end in punctuation, write the current
		// paragraph and start a new one
		if (!this.#endsWithPunctuation(text)) {
			this.#writer.writeParagraph(this.#currentParagraphText);
			this.#currentParagraphText = '';
		}
	}

	#endsWithPunctuation(text) {
		return text.endsWith('.')
			|| text.endsWith('?')
			|| text.endsWith('…')
			|| text.endsWith(',');
	}
}

export class PlainTextWriter {
	// Configuration
	#output;
	#blankLineBeforeTimestamp;
	// State
	#isFirstSpeaker = true;
	#isFirstParagraphOfSpeaker = true;

	constructor(output, blankLineBeforeTimestamp) {
		this.#output = output;
		this.#blankLineBeforeTimestamp = blankLineBeforeTimestamp;
	}

	writeTimestamp(text) {
		if (!this.#isFirstSpeaker && this.#blankLineBeforeTimestamp) {
			this.#output.write('\n');
		}

		this.#output.write(text);
		this.#output.write('\n');

		this.#isFirstSpeaker = false;
		this.#isFirstParagraphOfSpeaker = true;
	}

	writeParagraph(text) {
		// Separate paragraphs by a blank line
		if (!this.#isFirstParagraphOfSpeaker) {
			this.#output.write('\n');
		}

		this.#output.write(text);
		this.#output.write('\n');

		this.#isFirstParagraphOfSpeaker = false;
	}

	end() {
		this.#output.end();
	}
}

export class HTMLWriter {
	// Configuration
	#output;

	constructor(output) {
		this.#output = output;

		this.#output.write('<!DOCTYPE html>\n');
		this.#output.write('<html>\n');
		this.#output.write('<head>\n');
		this.#output.write('<title>Zoom Transcript</title>\n');
		this.#output.write('</head>\n');
		this.#output.write('<body>\n');
		this.#output.write('<h1>Zoom Transcript</h1>\n');
	}

	writeTimestamp(text) {
		this.#output.write('<h2>');
		this.#output.write(escapeHTML(text));
		this.#output.write('</h2>\n');
	}

	writeParagraph(text) {
		this.#output.write('<p>');
		this.#output.write(escapeHTML(text));
		this.#output.write('</p>\n');
	}

	end() {
		this.#output.write('</body>\n');
		this.#output.write('</html>\n');
		this.#output.end();
	}
}

/**
 * Returns a new string with the characters &, <, >, ", and ' replaced with
 * their corresponding HTML entity.
 * @param {string} text Text to do the replacement on.
 * @returns {string} The provided 'text' with the characters replaced.
 */
function escapeHTML(text) {
	return text
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll('\'', '&#039;');
}
