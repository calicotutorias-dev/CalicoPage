import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "src/ISIS3710_202520_S1_E06_Back/**",
      "dist/**"
    ]
  },
  ...compat.extends("next/core-web-vitals")
];

export default eslintConfig;
