export class ZoomTranscriptFormatter {
	constructor(output, options = {}) {
		this.output = output;

		// Options
		this.blankLineBeforeTimestamp = false;
		if (Object.hasOwn(options, 'blankLineBeforeTimestamp')) {
			this.blankLineBeforeTimestamp = options.blankLineBeforeTimestamp;
		}

		// Regular expression for matching a timestamp line
		this.timestampRe = /^\[([^\]]+)\]\s+\d\d:\d\d:\d\d$/;

		// Formatter state
		this.previousSpeakerName = '';
		this.isFirstSpeaker = true;
		this.isFirstTextOfParagraph = true;
		this.continueParagraph = true;
	}

	line(line) {
		const matches = line.match(this.timestampRe);
		if (matches) {
			this.handleTimestamp(matches[1], line);
		} else if (line !== '') {
			this.handleText(line);
		}
	}

	end() {
		// Add a final newline for the current paragraph
		this.output.write('\n');
		this.output.end();
	}

	handleTimestamp(name, text) {
		if (this.isFirstSpeaker || name !== this.previousSpeakerName) {
			// We have changed speakers (or it's the first speaker)

			if (!this.isFirstSpeaker) {
				// If not the first speaker, write a newline to
				// end the current paragraph
				this.output.write('\n');

				if (this.blankLineBeforeTimestamp) {
					this.output.write('\n');
				}
			}

			// Write the timestamp
			this.output.write(text);
			this.output.write('\n');

			// Set the formatter state for the new speaker
			this.previousSpeakerName = name;
			this.isFirstSpeaker = false;
			this.isFirstTextOfParagraph = true;
			this.continueParagraph = true;
		}
	}

	handleText(text) {
		if (!this.continueParagraph) {
			// Begin a new paragraph
			this.output.write('\n\n');
			this.isFirstTextOfParagraph = true;
		}

		if (!this.isFirstTextOfParagraph) {
			// Separate text within a paragraph by a space
			this.output.write(' ');
		}

		this.output.write(text);
		this.isFirstTextOfParagraph = false;
		this.continueParagraph = this.endsWithPunctuation(text);
	}

	endsWithPunctuation(text) {
		return text.endsWith('.')
			|| text.endsWith('?')
			|| text.endsWith('…')
			|| text.endsWith(',');
	}
}
