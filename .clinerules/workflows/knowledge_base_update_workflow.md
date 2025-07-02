# Workflow: Automated Knowledge Base Update

This workflow automates the process of updating the `knowledge_base.md` file by analyzing recent commits and incorporating relevant changes.

## Steps

1.  **Analyze Recent Commits**:
    - Use the `github.com/modelcontextprotocol/servers/tree/main/src/github` MCP server.
    - Execute the `list_commits` tool to retrieve the most recent commits from the repository.
    - Filter commits to identify those with messages indicating changes to features, bug fixes, or documentation.

2.  **Update Knowledge Base**:
    - Read the existing content of the `knowledge_base.md` file.
    - For each relevant commit, generate a summary of the changes.
    - Append the summaries to the `knowledge_base.md` file under a "Recent Updates" section.

3.  **Request User Feedback**:
    - After updating the file, use the `ask_followup_question` tool.
    - Prompt the user with: "The knowledge base has been updated based on recent commits. Please review the changes in `knowledge_base.md` and confirm if they are accurate and complete."
    - Provide options: "Yes, the changes are accurate." and "No, the changes need revision."
