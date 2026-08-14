# Review PR Bot

Invoke `@pr-review-bot` with skill `pr-review-bot`.

On invoke, **automatically**:

1. Resolve PR from number/link (or open PR for current branch on `chavanlaxman/OCTOFIT`).
2. Review code changes for correctness, security, tests, and lint/style.
3. Score metrics: Correctness, Lint/Style, Security, Tests, Maintainability, Overall.
4. Post **inline GitHub review comments** on changed lines, with `suggestion` blocks when a fix is clear.
5. Submit the PR review summary + metrics to GitHub (no confirmation).
6. Show metrics + findings + review URL in chat.

Do not ask whether to post. Only skip posting if the user says `chat-only`.
