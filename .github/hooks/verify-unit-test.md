## Purpose
Apply this hook whenever the Implementation or Verify agent creates, updates, or reviews unit tests for a changed behavior.

## Scope
- Use for backend and frontend unit tests.
- Use when a behavioral change, contract change, regression fix, or focused edge-case fix is implemented.
- Skip only when the change is documentation-only, configuration-only, or otherwise has no executable behavior to test. State that explicitly.

## Hook Instructions
- Verify that each added or updated unit test maps to the changed behavior or a closely related regression risk.
- Require at least one happy-path assertion for each newly introduced behavior unless the behavior is error-only.
- Require the most relevant edge-case assertion when the change introduces branching, validation, fallback behavior, or error handling.
- Keep tests deterministic and isolated. Avoid real network calls, sleeping, wall-clock dependence, and unnecessary shared state.
- Prefer assertions on observable behavior, outputs, state transitions, or contracts rather than private implementation details.
- Keep the test scope narrow. Do not expand into broad end-to-end coverage when a focused unit or integration test is sufficient.
- If an existing test already covers the changed behavior, update it instead of adding redundant coverage.
- If no unit test is added for a code change that should be testable, call that out as a verification gap and do not mark the work complete without justification.
- Run the smallest relevant test command first and record the exact command and result.
- If a test fails because it reveals a product defect, fix the product code or the invalid expectation, then rerun the same focused test.

## Output Requirements
When this hook applies, include:
- Tests Added Or Updated
- Behavior Covered
- Edge Cases Covered
- Command Run
- Execution Result
- Remaining Gaps

## Decision Rules
- Do not claim PASS when necessary unit coverage for the changed behavior is missing and could reasonably have been added.
- Do not claim PASS when tests were written but not executed unless execution was genuinely blocked and the blocker is stated.
- For documentation-only or configuration-only changes, state that no unit test hook action was required.
