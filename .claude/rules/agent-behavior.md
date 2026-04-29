## Agent Behavior & Decision Logic

- **Context Lock**: If target files/logic/output are unclear within 10s, **STOP**. Do not blind-search.
- **Action**: Ask the user: _"Tôi chưa rõ context cho task này. Bạn có thể cho biết thêm: [specific question]?"_
- **Ask First**: If the feature/flow is new, module is missing, or task is ambiguous (e.g., "fix auth").
- **Explore First**: Only if the file path is known, it's a follow-up, or the entry point is explicitly defined.
- **Efficiency**: Prioritize `read_file` on specific targets over wide-directory `ls`.
- **Response**: Be concise. Show code first, explain briefly after.
