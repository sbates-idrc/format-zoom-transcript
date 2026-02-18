```text
$ fold -s -w 72 example.txt
[Alice] 10:00:00
Zoom transcripts may have multiple consecutive timestamped entries for
a single speaker.

[Alice] 10:00:10
This utility combines them together under a single timestamp.

[Bob] 10:00:20
That sounds handy!

$ node format-zoom-transcript.js --blank-line-before-timestamp < example.txt | fold -s -w 72
[Alice] 10:00:00
Zoom transcripts may have multiple consecutive timestamped entries for
a single speaker. This utility combines them together under a single
timestamp.

[Bob] 10:00:20
That sounds handy!
```
