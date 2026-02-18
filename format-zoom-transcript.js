import { ZoomTranscriptFormatter } from './zoom-transcript-formatter.js';
import * as process from 'node:process';
import * as readline from 'node:readline';
import { Readable, Writable } from 'node:stream';
import { parseArgs } from 'node:util';

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

/**
 * Displays the program help text.
 */
function displayHelp() {
	console.log('Usage: node format-zoom-transcript.js [options]');
	console.log();
	console.log('Options:');
	console.log();
	console.log('--blank-line-before-timestamp   Insert a blank line before each timestamp');
	console.log('-h, --help                      Display this help text');
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
};

const { values } = parseArgs({ options });

if (values.help) {
	displayHelp();
} else {
	formatTranscript(process.stdin, process.stdout, {
		blankLineBeforeTimestamp: values['blank-line-before-timestamp'],
	});
}
