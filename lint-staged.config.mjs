/* global process */

const isCI = process.env.CI === 'true';

export default {
  '*.{ts,tsx,js,jsx,mjs}': [
    'eslint --fix --no-warn-ignored',
    ...(isCI ? ['eslint --max-warnings=0'] : []),
    'prettier --write',
  ],
  '*.{json,css,scss,md}': ['prettier --write'],
};
