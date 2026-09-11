# Contributing

All AI contributors must read the [shared collaboration policy](AI-COLLABORATION-POLICY.md) and [project checkpoint](docs/PROJECT-STATE.md) before starting. Use the same policy regardless of model or tool.

Use an issue to describe a bug or proposed change, then send a pull request. Include reproduction steps and relevant test results. Do not post tokens, private conversations, machine identifiers, or unredacted logs.

Install Node.js and pnpm, run `pnpm install --frozen-lockfile`, then `pnpm start`. Windows installers are built with `pnpm dist`. Keep the package name, application ID and user profile directory stable so upgrades preserve user data.

Run `node --test host-manager.test.cjs setup.test.cjs updates.test.cjs` and `pnpm test:ui` for affected behavior. Host service changes also need the Host smoke and lifecycle checks and real Windows validation.
