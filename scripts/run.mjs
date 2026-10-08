import { createRequire } from "node:module";
import { resolve, dirname } from "node:path";
import { spawnSync } from "node:child_process";

// The optional directory keeps build dependencies outside restricted workspaces.
// A normal npm ci needs no environment variable.
const require = createRequire(
  process.env.FLAPPY_DEPS_DIR
    ? resolve(process.env.FLAPPY_DEPS_DIR, "package.json")
    : new URL("../package.json", import.meta.url),
);
const [tool, ...args] = process.argv.slice(2);
const bins = { vite: ["vite", "bin/vite.js"], tsc: ["typescript", "bin/tsc"] };
if (!(tool in bins)) throw new Error(`Unknown build tool: ${tool}`);
const [pkg, bin] = bins[tool];
const result = spawnSync(
  process.execPath,
  [resolve(dirname(require.resolve(`${pkg}/package.json`)), bin), ...args],
  { stdio: "inherit" },
);
process.exit(result.status ?? 1);
