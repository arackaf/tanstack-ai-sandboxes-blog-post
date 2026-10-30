import { createSecrets, defineSandbox, defineWorkspace, githubRepo } from "@tanstack/ai-sandbox";
import { railwaySandbox } from "@tanstack/ai-sandbox-railway";

export const sandboxRailway = defineSandbox({
  id: "repo-agent",
  provider: railwaySandbox({}),
  workspace: defineWorkspace({
    source: githubRepo({
      repo: "arackaf/tanstack-ai-sandboxes-blog-post",
    }),
    setup: ["npm install"],
    secrets: createSecrets({
      ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY ?? "",
      GH_TOKEN: process.env.GH_TOKEN ?? "",
    }),
    instructions:
      "To publish work: run `gh auth setup-git` once, then `git push -u origin <branch>` and `gh pr create`. GH_TOKEN is already in the environment.",
  }),
  lifecycle: { reuse: "thread" },
});
