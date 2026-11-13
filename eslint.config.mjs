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
    // HyperFrames film project (separate toolchain)
    "film/**",
    // Vendored Draco decoder from three.js (minified)
    "public/draco/**",
    // Cloudflare build output
    ".open-next/**",
    ".wrangler/**",
  ]),
]);

export default eslintConfig;
