const issueParams = new URLSearchParams({
  title: "Request TryJS Pro early access",
  body: [
    "I'm a teacher or technical author interested in TryJS Pro early access.",
    "",
    "What I teach or publish:",
    "",
    "The capability I need most (saved examples, private examples, custom branding, or something else):",
    "",
    "Anything else that would make runnable examples easier to share:",
  ].join("\n"),
});

/**
 * Public, inspectable intent collection with no hidden form or data capture.
 * People can review and edit the issue before choosing whether to submit it.
 */
export const EARLY_ACCESS_URL =
  `https://github.com/berkinduz/try-js/issues/new?${issueParams.toString()}`;
