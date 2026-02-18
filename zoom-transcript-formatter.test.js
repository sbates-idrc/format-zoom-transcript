import { ZoomTranscriptFormatter } from './zoom-transcript-formatter.js';
import assert from 'node:assert/strict';
import { Writable } from 'node:stream';
import test from 'node:test';

class StringWritable extends Writable {
	constructor() {
		super();
		this.contents = '';
	}

	_write(chunk, encoding, callback) {
		this.contents += chunk;
		callback();
	}

	getContents() {
		return this.contents;
	}
}

/**
 * Creates a ZoomTranscriptFormatter instance and asserts that the
 * 'expectedLines' output lines are generated from the given 'inputLines'.
 * @param {Array} inputLines Lines to input to the formatter.
 * @param {Array} expectedLines Expected output lines from the formatter.
 * @param {object} formatterOptions Options for ZoomTranscriptFormatter.
 */
function checkFormatter(inputLines, expectedLines, formatterOptions) {
	const output = new StringWritable();
	const formatter = new ZoomTranscriptFormatter(output, formatterOptions);

	for (const line of inputLines) {
		formatter.line(line);
	}

	formatter.end();

	assert.strictEqual(output.getContents(), expectedLines.join('\n') + '\n');
}

test('ZoomTranscriptFormatter concatenates text ending with punctuation for a single speaker into a single paragraph', () => {
	const inputLines = [
		'[name one] 12:34:56',
		'text one.',
		'',
		'[name one] 23:45:67',
		'text two?',
		'',
		'[name one] 34:56:78',
		'text three…',
		'',
		'[name one] 45:67:89',
		'text four,',
		'',
		'[name one] 56:78:90',
		'text five.',
		'',
		'[name two] 67:89:01',
		'text six.',
	];

	const expectedLines = [
		'[name one] 12:34:56',
		'text one. text two? text three… text four, text five.',
		'[name two] 67:89:01',
		'text six.',
	];

	checkFormatter(inputLines, expectedLines, {});
});

test('ZoomTranscriptFormatter starts a new paragraph when text does not end with punctuation', () => {
	const inputLines = [
		// Text not ending in punctuation at start of paragraph
		'[name one] 12:34:56',
		'text one',
		'',
		'[name one] 23:45:67',
		'text two.',
		'',
		// Within a paragraph
		'[name one] 34:56:78',
		'text three',
		'',
		// When not the first speaker
		'[name two] 45:67:89',
		'text four',
		'',
		// At the end of the file
		'[name three] 56:78:90',
		'text five',
	];

	const expectedLines = [
		'[name one] 12:34:56',
		'text one',
		'',
		'text two. text three',
		'[name two] 45:67:89',
		'text four',
		'[name three] 56:78:90',
		'text five',
	];

	checkFormatter(inputLines, expectedLines, {});
});

test('ZoomTranscriptFormatter writes a blank line before timestamps when the blankLineBeforeTimestamp option is set', () => {
	const inputLines = [
		'[name one] 12:34:56',
		'text one.',
		'',
		'[name two] 23:45:67',
		'text two.',
		'',
		'[name two] 34:56:78',
		'text three.',
		'',
		'[name three] 45:67:89',
		'text four.',
	];

	const expectedLines = [
		'[name one] 12:34:56',
		'text one.',
		'',
		'[name two] 23:45:67',
		'text two. text three.',
		'',
		'[name three] 45:67:89',
		'text four.',
	];

	checkFormatter(inputLines, expectedLines, {
		blankLineBeforeTimestamp: true,
	});
});
