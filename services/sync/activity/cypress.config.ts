import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      return config;
    },
  },
  env: {
    NODE_CONFIG_DIR: process.cwd(),
    NODE_CONFIG: JSON.stringify(require('config'))
  }
});
