export default {
  '*.{ts,tsx,js,jsx,mjs}': ['eslint --fix --max-warnings=0 --no-warn-ignored', 'prettier --write'],
  '*.{json,css,scss,md}': ['prettier --write'],
};
