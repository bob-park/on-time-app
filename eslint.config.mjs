// eslint.config.mjs
import eslintConfig from '@bob-park/eslint-config-bobpark';

import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
  {
    extends: [eslintConfig],
  },
  globalIgnores(['**/*.cjs', '**/*.mjs', '**/*.config.js', '**/*.config.ts']),
]);
