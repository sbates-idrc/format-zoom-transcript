import {ZoomTranscriptFormatter} from './zoom-transcript-formatter.js';
import * as process from 'node:process';
import * as readline from 'node:readline';
import {Readable, Writable} from 'node:stream';

/**
 * Reads a Zoom transcript from 'input' and writes a formatted version
 * to 'output'.
 * @param {Readable} input Stream to read the Zoom transcript from.
 * @param {Writable} output Stream to write the formatted transcript to.
 * @param {object} formatterOptions Options for ZoomTranscriptFormatter.
 */
function formatTranscript(input, output, formatterOptions) {
	const formatter = new ZoomTranscriptFormatter(output, formatterOptions);

	// Use the Node.js 'readline' module to feed the input stream to the
	// formatter one line at a time

	const rl = readline.createInterface({
		input,
		crlfDelay: Infinity,
	});

	rl.on('close', () => {
		formatter.end();
	});

	rl.on('line', (line) => {
		formatter.line(line);
	});
}

formatTranscript(process.stdin, process.stdout, {
	blankLineBeforeTimestamp: true,
});
