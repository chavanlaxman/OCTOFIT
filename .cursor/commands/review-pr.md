# Review PR

Invoke `@pr-review-bot` and skill `pr-review-bot` (Cursor-Bot style).

On invoke, **automatically**:

1. Resolve the PR from the number/link (or the open PR for the current branch on `chavanlaxman/OCTOFIT`).
2. Review the **code diff** for correctness, bugs, tests, security, and lint/style.
3. Compute metrics (Correctness, Lint/Style, Security, Tests, Maintainability, Overall).
4. Show findings + metrics in chat.
5. **Immediately post to GitHub**:
   - Inline line comments on changed code
   - `suggestion` blocks for concrete fixes
   - Review summary with metrics scorecard (`REQUEST_CHANGES` / `COMMENT` / `APPROVE`)
6. Return the GitHub review URL (or posting error).

Do **not** ask whether to post. Posting is the default. Only skip posting if the user explicitly says `chat-only`.

Ask for a PR number/link only if it cannot be inferred.
