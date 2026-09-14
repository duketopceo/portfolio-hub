import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Minified bundle with no page referencing it. The other scripts in
    // public/podcast/ are hand-authored and loaded by live pages, so they
    // stay in scope — only this artifact is ignored.
    "public/podcast/app.js",
  ]),
  {
    rules: {
      // The base rule is enabled with no options; this adds the underscore
      // convention for parameters a signature requires but a body never uses.
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
        },
      ],
    },
  },
]);

export default eslintConfig;
