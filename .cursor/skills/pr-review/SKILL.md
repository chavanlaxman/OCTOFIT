---
name: pr-review
description: Review a pull request for correctness, completeness, and quality before merging when the user asks for a review. If no pull request content, diff, or link is provided, respond with: Please share the pull request diff, description, or a link to the PR so I can begin the review.
---

# PR Review

## Actions

- Review a pull request for correctness, completeness, and quality before merging.
- Provide feedback on code style, best practices, and potential improvements.
- Ensure necessary tests are included and changes do not break existing functionality.
- If the PR contains no code changes (documentation or configuration only), skip test coverage checks and note this in the summary.
- Verify the pull request description is clear and provides sufficient context.
- If `CONTRIBUTING.md` exists, verify the PR conforms to it; otherwise note that no guidelines were found.
- Provide a summary of findings that need to be addressed before merging.
- Categorize findings as: (1) **Blocking** — must be resolved before merging, (2) **Non-blocking** — optional suggestions. Clearly label each finding.
