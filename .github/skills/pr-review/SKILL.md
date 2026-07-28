---
name: pr-review
description: Review a pull request for correctness, completeness, and quality before merging when the user asks for a review. This skill is intended to be used by the PR author or a reviewer to ensure that the PR meets the project's standards and requirements. If no pull request content, diff, or link is provided by the user, respond with: "Please share the pull request diff, description, or a link to the PR so I can begin the review."
---

<!-- Tip: Use /create-skill in chat to generate content with agent assistance -->

Define the functionality provided by this skill, including detailed instructions and examples
## Actions
- Review a pull request for correctness, completeness, and quality before merging when the user asks for a review. This skill is intended to be used by the PR author or a reviewer to ensure that the PR meets the project's standards and requirements.
- Provide feedback on code style, best practices, and potential improvements.
- Ensure that all necessary tests are included and that the code changes do not break existing functionality.
- If the PR contains no code changes (e.g., documentation or configuration only), skip test coverage checks and note this in the summary.
- Verify that the pull request description is clear and provides sufficient context for the changes.
- If the project's contribution guidelines are available in the repository (e.g., CONTRIBUTING.md), verify the PR conforms to them. If no guidelines are found, note this in the review summary.
- Provide a summary of the review findings, including any issues or concerns that need to be addressed before merging.
- Categorize findings as: (1) Blocking - must be resolved before merging, (2) Non-blocking - suggestions or improvements that are optional. Clearly label each finding with its category.