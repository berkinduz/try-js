const issueParams = new URLSearchParams({
  title: "Share educator workflow and Pro interest",
  body: [
    "I'm a teacher or technical author who uses runnable examples.",
    "",
    "What I teach or publish:",
    "",
    "How I share examples with learners or readers today:",
    "",
    "The proposed capability I need most (organized library, private examples, branding, or something else):",
    "",
    "Would you pay for it? If yes, what would make it worth paying for?",
    "",
    "Anything else that gets in the way:",
  ].join("\n"),
});

/**
 * Public, inspectable intent collection with no hidden form or data capture.
 * People can review and edit the issue before choosing whether to submit it.
 */
export const EDUCATOR_FEEDBACK_URL =
  `https://github.com/berkinduz/try-js/issues/new?${issueParams.toString()}`;
