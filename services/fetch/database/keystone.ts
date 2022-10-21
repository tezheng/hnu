/*
Welcome to Keystone! This file is what keystone uses to start the app.

It looks at the default export, and expects a Keystone config object.

You can find all the config options in our docs here: https://keystonejs.com/docs/apis/config
*/

import { config as conf } from '@keystone-6/core';

import config from 'config';

// Look in the schema file for how we define our lists, and how users interact with them through graphql or the Admin UI
import { lists } from './src/schema';

// Keystone auth is configured separately - check out the basic auth setup we are importing from our auth file.
// import { withAuth, session } from './auth';

const dbconf = config.get('db');
const port = config.get<number>('port');

export default 
  // Using the config function helps typescript guide you to the available options.
  conf({
    server: {
      cors: true,
      port,
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
    db: dbconf as any,
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
