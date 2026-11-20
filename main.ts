// gta6-meme-x-01-v3 entrypoint.
//
// The whole job of this program is to hand the scorer the post record:
// it takes POST.json from this repository and places an identical copy in
// the output directory. Everything else the entry needs (the meme image,
// the README) already lives in the repo; nothing is generated here.

import { copyFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const X_POST = /^https:\/\/(x\.com|twitter\.com)\/[^/]+\/status\/[0-9]+$/;

function repoRoot(): string {
  const fromEnv = process.env.MAKEFUN_BOT_DIR;
  if (fromEnv && fromEnv.length > 0) return fromEnv;
  return dirname(fileURLToPath(import.meta.url));
}

function outputDir(): string {
  const fromEnv = process.env.MAKEFUN_OUTPUT_DIR;
  if (fromEnv && fromEnv.length > 0) return fromEnv;
  return "/output";
}

function fail(message: string): never {
  console.error(`gta6-meme-x-01-v3: ${message}`);
  process.exit(1);
}

function main(): void {
  const root = repoRoot();
  const out = outputDir();
  const source = join(root, "POST.json");
  const target = join(out, "POST.json");

  if (!existsSync(source)) fail(`POST.json not found at ${source}`);
  if (!existsSync(join(root, "meme.webp"))) fail("meme.webp not found in repo root");

  let record: unknown;
  try {
    record = JSON.parse(readFileSync(source, "utf8"));
  } catch {
    fail("POST.json is not valid JSON");
  }
  const url =
    record !== null && typeof record === "object"
      ? (record as { url?: unknown }).url
      : undefined;
  if (typeof url !== "string" || !X_POST.test(url)) {
    fail("POST.json does not carry a valid X post url");
  }

  try {
    mkdirSync(out, { recursive: true });
    copyFileSync(source, target);
  } catch (error) {
    fail(`could not copy POST.json to ${target}: ${String(error)}`);
  }

  console.log(JSON.stringify({ ok: true, copied: "POST.json", url }));
}

main();
