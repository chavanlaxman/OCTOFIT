# Run Master SDLC Flow

Run `@master-sdlc-flow` for the given Jira key.

1. Read `octofit.json` and block a new story if prior work is failed/in-progress unless the user overrides.
2. Execute stages 1–8 in order using `.cursor/agents/`.
3. Write artifacts under `artifacts/<JIRA-KEY>/`.
4. Update `octofit.json` after each stage.

Ask for the Jira key if missing.
