import { defineWebExtConfig } from 'wxt';

export default defineWebExtConfig({
  startUrls: ['https://www.baidu.com', 'chrome://extensions/'],
  chromiumArgs: ['chrome://extensions/'],
});
