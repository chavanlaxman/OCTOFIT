---
name: "Copilot Instructions"
description: "Instructions for GitHub Copilot usage in this repository."
applyTo: "**/*.md"
---
We are building a capstone project that uses GitHub Copilot to assist in the software development lifecycle (SDLC). The project is structured to leverage Copilot's capabilities for generating code, documentation, and other artifacts based on user prompts and existing project context.

- Follow the instructions in the `.github/copilot-instructions.md` file for guidance on how to effectively use Copilot in this repository.

- read the existing json file `octofit.json`,  and if all phases are succeed then only start with new story implementation. If any phase fails, provide a detailed report of the issues and suggest corrective actions.

- if any phase is in-progress, ask user to start from `.github/agents/master-agent.md` and follow the instructions in the agent files for each stage of the SDLC.

- For new story start with `.github/agents/master-agent.md` and follow the instructions in the agent files for each stage of the SDLC.
