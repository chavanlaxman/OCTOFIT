---
name: pr-review
description: Review a pull request and post findings to GitHub. Prefer the Cursor-Bot workflow in skill pr-review-bot (inline comments, suggestions, metrics). Use when the user asks for a PR review or runs /review-pr.
---

# PR Review

For full Cursor-Bot behavior (inline comments + suggestions + metrics), **follow skill `pr-review-bot`** and/or invoke `@pr-review-bot`.

Minimum behavior if bot skill is unavailable:

1. Resolve PR for `chavanlaxman/OCTOFIT`
2. Review and label Blocking / Non-blocking
3. Post to GitHub immediately (summary review)
4. Return review URL

Skip posting only when user says `chat-only`.
