# AGENTS.md

## Project Context

- This workspace contains the `4945区` visual-novel project, with the main application under `game/` and supporting design, narrative, documentation, and generated-artifact directories at the project root.
- The current project root is a Git repository. Before delegating parallel write tasks, create and verify a separate worktree for each worker; if worktree isolation cannot be confirmed, keep write tasks serial.

## Subagent Scheduling

- The main Agent owns the primary goal, decomposition, coordination, and final acceptance. `luna_worker` executes only independently completable delegated subtasks and must not redefine or expand the primary goal.
- Prefer `luna_worker` whenever a custom subagent is needed. The scheduling, isolation, task-contract, and acceptance rules in this section also apply to all other custom subagents.
- These same scheduling, isolation, task-contract, and acceptance principles apply to every other custom subagent.
- For large subtasks that are mutually independent, prefer dispatching multiple `luna_worker` agents in parallel. Keep lightweight tasks that can be completed within a few minutes in the main thread.
- Every worker assignment must be self-contained and specify all required context, exact file or resource scope, task boundaries and non-goals, expected output, and measurable acceptance criteria.
- Read-only tasks may run in parallel. Tasks that write files may run in parallel only when each worker uses a separate Git worktree. If worktree isolation is unavailable or cannot be confirmed, run the write tasks serially.
- After a worker finishes, the main Agent must inspect the result against every acceptance criterion and verify the relevant evidence or tests. If any criterion is unmet, clarify the gap and re-dispatch the task rather than accepting a partial result.
- If multiple workers cannot run concurrently, inspect `agents.max_concurrent_threads_per_session` in `~/.codex/config.toml` and confirm it is not set to `1` before investigating other causes. Do not overwrite unrelated Codex configuration while checking or adjusting this setting.
