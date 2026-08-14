---
name: pr-review-bot
description: Cursor-Bot-style automated PR review with inline GitHub comments, suggestion blocks, and correctness/lint-style metrics. Use for /review-pr-bot, /review-pr, or when the user asks for bot-like PR review comments on code changes.
---

# PR Review Bot

## Goal

Review a GitHub PR like Cursor Bot / Bugbot:

- Analyze **code changes** for correctness, bugs, edge cases, security, tests, and style
- Post **inline review comments** on changed lines
- Include **GitHub suggestion** blocks when a concrete fix exists
- Publish a **metrics scorecard** in the review summary and in chat
- Post automatically (no confirmation) unless user says `chat-only`

Default repo: `chavanlaxman/OCTOFIT`.

## Steps

### 1. Resolve PR

From number, URL, or current-branch PR. Capture:

- `owner`, `repo`, `pullNumber`, `headSha`, title, author

### 2. Collect change context

- Changed files + patch/diff
- Focus on `backend/`, `frontend/`, `e2e/`, tests, config that affects runtime
- Ignore or lightly scan `artifacts/**` unless clearly incorrect

### 3. Analyze (Cursor-Bot lens)

For each meaningful change, look for:

| Area | Examples |
|------|----------|
| Correctness | logic bugs, wrong status codes, broken contracts, race conditions, bad validation |
| Edge cases | empty input, 404 paths, timezone/date parsing, optional fields cleared unexpectedly |
| Security | injection, XSS, secrets, missing auth on sensitive ops (note scaffold limits) |
| Tests | missing happy-path/edge coverage for new behavior |
| Lint/style | naming, duplication, dead code, inconsistent patterns vs nearby files |
| Maintainability | unclear APIs, missing error handling, oversized functions |

Severity:

- `critical` — wrong behavior / likely production break / security hole → Blocking
- `major` — real defect or missing required coverage → Blocking if it fails AC
- `minor` — should fix soon → Non-blocking
- `nit` / `suggestion` — polish → Non-blocking

Cap inline comments at ~15 highest-value items (merge duplicates). Prefer fewer precise comments over noise.

### 4. Metrics scorecard (0–100)

Score each dimension; explain briefly.

| Metric | How to score |
|--------|----------------|
| **Correctness** | 100 = no logic/contract issues found; −15 critical, −8 major, −3 minor |
| **Lint / Style** | 100 = consistent with repo patterns; deduct for duplication, naming, dead code, formatting smells |
| **Security** | 100 = no new security concerns beyond accepted scaffold limits; deduct for new risky patterns |
| **Tests** | 100 = new behavior covered (unit + relevant e2e/smoke); deduct for gaps |
| **Maintainability** | 100 = clear structure/errors/boundaries; deduct for complexity/unclear contracts |
| **Overall** | Weighted average: Correctness 35%, Tests 20%, Security 15%, Lint 15%, Maintainability 15% |

Also report letter band:

- A: 90–100
- B: 80–89
- C: 70–79
- D: 60–69
- F: <60

If tests were executed, include command + pass/fail counts in the summary.

### 5. Post to GitHub (automatic)

#### Preferred: pending review + line comments

1. `pull_request_review_write` method `create` **without** event (pending), body can be draft summary
2. For each finding with a line: `add_comment_to_pending_review`
   - `subjectType`: `LINE`
   - `path`, `line`, `side`: `RIGHT`
   - `body` format:

```markdown
[major] Validation accepts impossible calendar dates

`Date('YYYY-MM-DD')` can normalize invalid days. Prefer explicit Y/M/D bounds checks.

```suggestion
} else if (!DATE_PATTERN.test(date) || !isValidIsoDate(date)) {
  addError(errors, 'date', 'Date must be a valid YYYY-MM-DD value.');
```
```

3. `pull_request_review_write` method `submit_pending` with final body + event:
   - `REQUEST_CHANGES` if any critical/blocking
   - else `COMMENT` (use COMMENT for self-review instead of APPROVE)
   - `APPROVE` only when clean, high confidence, not self-review

Final review body must include:

```markdown
## PR Review Bot Summary
**Overall:** <score>/100 (<band>)

| Metric | Score |
|--------|------:|
| Correctness | N |
| Lint / Style | N |
| Security | N |
| Tests | N |
| Maintainability | N |
| **Overall** | **N** |

### Blocking
- ...

### Non-blocking
- ...

### Checks run
- ...
```

#### Fallback if MCP write fails (use `gh`)

Create one review with inline comments via API:

```bash
gh api repos/chavanlaxman/OCTOFIT/pulls/<N>/reviews -f commit_id='<headSha>' -f event='COMMENT' -f body='...' \
  --raw-field 'comments=[{...}]'
```

Or write a temp JSON file and:

```bash
gh api repos/chavanlaxman/OCTOFIT/pulls/<N>/reviews --input review.json
```

Where each comment has `path`, `line`, `side`=`RIGHT`, `body`.

If inline API fails, post summary with `gh pr review <N> --comment|--request-changes|--approve` and report that inline comments were skipped.

### 6. Chat output

Always return:

1. Metrics scorecard
2. Findings table: Severity | Location (`file:line`) | Finding
3. Inline comments posted: count
4. Review URL
5. Posting errors/blockers if any
