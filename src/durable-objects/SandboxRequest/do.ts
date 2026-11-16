import { DurableObject } from "cloudflare:workers";

export class SandboxRequest extends DurableObject<Env> {
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
  }
}
