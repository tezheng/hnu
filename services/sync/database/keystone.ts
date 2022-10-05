/*
Welcome to Keystone! This file is what keystone uses to start the app.

It looks at the default export, and expects a Keystone config object.

You can find all the config options in our docs here: https://keystonejs.com/docs/apis/config
*/

import { config } from '@keystone-6/core';

// Look in the schema file for how we define our lists, and how users interact with them through graphql or the Admin UI
import { lists } from './src/schema';

// Keystone auth is configured separately - check out the basic auth setup we are importing from our auth file.
// import { withAuth, session } from './auth';

export default 
  // Using the config function helps typescript guide you to the available options.
  config({
    server: {
      cors: {
        origin: [
          'http://localhost:5173',
          'http://localhost:8888',
        ],
        credentials: false,
      },
      port: 3456,
      maxFileSize: 20 * 1024 * 1024,
      healthCheck: {
        path: '/healthcheck',
        data: () => ({
          status: 'healthy',
          timestamp: Date.now(),
          uptime: process.uptime(),
        }),
      },
    },
    // the db sets the database provider - we're using sqlite for the fastest startup experience
    db: {
      provider: 'sqlite',
      url: 'file:/var/lib/database/sync.db',
      enableLogging: true,
      useMigrations: true,
    },
    // This config allows us to set up features of the Admin UI https://keystonejs.com/docs/apis/config#ui
    ui: {
      // For our starter, we check that someone has session data before letting them see the Admin UI.
      isDisabled: false,
      // isAccessAllowed: (context) => !!context.session?.data,
      isAccessAllowed: async () => true,
    },
    lists,
    // session,
  });
