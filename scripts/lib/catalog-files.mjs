// Shared by the catalog scripts and tests: catalog entry file names, sorted.
// Plain node:fs only so the dependency-free privacy check can use it.
import { readdirSync } from "node:fs";

/** `.json` files in `dir` not starting with "_" (those hold generated data), default-sorted. */
export function catalogFileNames(dir) {
  return readdirSync(dir)
    .filter((f) => f.endsWith(".json") && !f.startsWith("_"))
    .sort();
}
