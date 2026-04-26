# Agent Behavior

## Context Before Action

If a task is assigned and within ~10 seconds of thinking you still cannot identify:

- Which file(s) to read
- Where the relevant code lives
- What the expected output looks like

**Stop immediately. Do not explore blindly. Ask the user:**

> "Tôi chưa rõ context cho task này. Bạn có thể cho biết thêm: [câu hỏi cụ thể]?"

This prevents wasting tokens on wide searches that miss the mark.

## When to Ask vs. When to Explore

**Ask first** when:

- The task references a feature/flow you haven't seen in this session
- The task involves a file or module name you can't locate quickly
- The scope is ambiguous (e.g., "fix the auth bug" — which one?)

**Explore first** when:

- You know exactly which file(s) are relevant
- The task is a follow-up to something already discussed
- The entry point is obvious from the task description
