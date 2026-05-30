import { defineWebExtConfig } from 'wxt';

export default defineWebExtConfig({
  startUrls: ['https://www.bing.com', 'chrome://extensions/'],
  chromiumArgs: ['chrome://extensions/'],
});
