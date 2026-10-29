import { createSecrets, defineSandbox, defineWorkspace, githubRepo } from "@tanstack/ai-sandbox";
import { vercelSandbox } from "@tanstack/ai-sandbox-vercel";

export const sandboxVercel = defineSandbox({
  id: "repo-agent",
  provider: vercelSandbox({}),
  workspace: defineWorkspace({
    source: githubRepo({ repo: "arackaf/tanstack-ai-sandboxes-blog-post" }),
    setup: [
      "sudo npm install -g @anthropic-ai/claude-code",

      "sudo dnf install -y 'dnf-command(config-manager)'",
      "sudo dnf config-manager --add-repo https://cli.github.com/packages/rpm/gh-cli.repo",
      "sudo dnf install -y gh",

      "npm install",
    ],
    secrets: createSecrets({
      ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY ?? "",
      GH_TOKEN: process.env.GH_TOKEN ?? "",
    }),
    instructions:
      "Accomplish the user's request and create a pull request. To publish work: run `gh auth setup-git` once, then `git push -u origin <branch>` and `gh pr create`. GH_TOKEN is already in the environment.",
  }),
  lifecycle: { reuse: "thread" },
});
