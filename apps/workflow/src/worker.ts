
import { Worker, NativeConnection } from '@temporalio/worker';

import config from 'config';

const taskQueue = config.get<string>('TaskQueue');
const address = config.get<string>('TemporalServer');

async function run() {
  const connection = await NativeConnection.connect({
    address,
    // // Connect to localhost with default ConnectionOptions.
    // // In production, pass options to the Connection constructor to configure TLS and other settings:
    // address: 'foo.bar.tmprl.cloud', // as provisioned
    // tls: {} // as provisioned
  });

  // Step 1: Register Workflows and Activities with the Worker and connect to
  // the Temporal server.
  const worker = await Worker.create({
    taskQueue,
    connection,
    workflowsPath: require.resolve('./workflows'),
  });
  // Worker connects to localhost by default and uses console.error for logging.
  // Customize the Worker by passing more options to create():
  // https://typescript.temporal.io/api/classes/worker.Worker
  // If you need to configure server connection parameters, see docs:
  // https://docs.temporal.io/typescript/security#encryption-in-transit-with-mtls

  // Step 2: Start accepting tasks on the `hello-world` queue
  await worker.run();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
