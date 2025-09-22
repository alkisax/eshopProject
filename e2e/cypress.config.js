const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    chromeWebSecurity: false,  // needed because of iframes
    setupNodeEvents(on, config) {
      process.env.NODE_ENV = 'test';
      // implement node event listeners here
    },
  },
});
