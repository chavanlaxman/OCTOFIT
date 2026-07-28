# Reusable Prompt: Activate Jira and GitLab MCP

Use this prompt in VS Code chat when you need the agent to bring both MCP paths online, verify they are reachable, and then use Jira to read a story.

## Copy-Paste Prompt

```md
Activate the workspace MCP integrations for Jira and GitLab.

Requirements:
1. Read the workspace MCP configuration first and use it as the source of truth.
2. Verify whether the Atlassian Jira/Confluence MCP HTTP endpoint is already running.
3. If the Atlassian MCP endpoint is reachable, do not restart it. Initialize it over HTTP stream and confirm the server responds.
4. Start the GitLab MCP server from the configured command if it is not already running.
5. Verify that the GitLab personal access token environment variable is present without printing the secret.
6. Confirm which MCP paths are available and usable from this session.
7. Read the requested Jira issue through the Atlassian MCP server, not through raw Jira REST, unless MCP is unavailable.
8. Summarize the issue key, summary, description, and acceptance criteria.

Execution rules:
- Prefer the workspace MCP config file as the authority for endpoint URL and startup command.
- For Atlassian MCP over HTTP, send the required Accept header for both application/json and text/event-stream.
- If PowerShell warns about Invoke-WebRequest script parsing, use -UseBasicParsing.
- Treat "server is listening" and "tool is callable" as separate checks.
- If a tool call fails, inspect the MCP tool schema and retry with the correct argument shape before concluding it is broken.
- Do not expose secrets.

Expected output:
- Atlassian MCP status
- GitLab MCP status
- Validation performed
- Jira issue summary for <ISSUE_KEY>
- Exact blocker if any step fails
```

## Example Invocation

Replace `<ISSUE_KEY>` with the story you want to read, for example `OCTOFIT-10`.

```md
Activate the workspace MCP integrations for Jira and GitLab, then read Jira issue OCTOFIT-10 through the Atlassian MCP server and summarize its user story and acceptance criteria.
```

## Notes

- This prompt is designed for the MCP layout currently configured in `.kiro/settings/mcp.json`.
- It matches the flow used here: detect Atlassian on `http://localhost:3002/mcp`, start GitLab with the configured `npx` command, initialize the Atlassian MCP session, then call `jira_get_issue` through MCP.