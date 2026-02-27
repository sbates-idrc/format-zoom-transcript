import { HTMLWriter, PlainTextWriter, ZoomTranscriptFormatter } from './zoom-transcript-formatter.js';
import * as process from 'node:process';
import * as readline from 'node:readline';
import { Readable } from 'node:stream';
import { parseArgs } from 'node:util';

/**
 * Reads a Zoom transcript from 'input' and writes a formatted version
 * to 'output'.
 * @param {Readable} input Stream to read the Zoom transcript from.
 * @param {object} writer The writer to provide to the ZoomTranscriptFormatter.
 */
function formatTranscript(input, writer) {
	const formatter = new ZoomTranscriptFormatter(writer);

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

/**
 * Displays the program help text.
 */
function displayHelp() {
	//           12345678901234567890123456789012345678901234567890123456789012345678901234567890
	console.log('Usage: node format-zoom-transcript.js [options]');
	console.log();
	console.log('Options:');
	console.log();
	console.log('--blank-line-before-timestamp   Insert a blank line before each timestamp');
	console.log('                                (plain text only)');
	console.log('-h, --help                      Display this help text');
	console.log('--html                          Output HTML instead of plain text');
	console.log();
}

const options = {
	'blank-line-before-timestamp': {
		type: 'boolean',
		default: false,
	},
	help: {
		type: 'boolean',
		short: 'h',
		default: false,
	},
	html: {
		type: 'boolean',
		default: false,
	},
};

const { values } = parseArgs({ options });

if (values.help) {
	displayHelp();
} else if (values.html) {
	formatTranscript(process.stdin, new HTMLWriter(process.stdout));
} else {
	const writer = new PlainTextWriter(process.stdout, values['blank-line-before-timestamp']);
	formatTranscript(process.stdin, writer);
}
