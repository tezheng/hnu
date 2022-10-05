
import { Connection, WorkflowClient } from '@temporalio/client';
import { nanoid } from 'nanoid';

import type { StoryType } from '@tezheng/hackernews';

import config from 'config';

const taskQueue = config.get<string>('TaskQueue');
const address = config.get<string>('TemporalServer');

const args: [StoryType] = ['BestStories'];

async function run() {
  const connection = await Connection.connect({
    address,
    // // Connect to localhost with default ConnectionOptions.
    // // In production, pass options to the Connection constructor to configure TLS and other settings:
    // address: 'foo.bar.tmprl.cloud', // as provisioned
    // tls: {} // as provisioned
  });

  const client = new WorkflowClient({
    connection,
    // namespace: 'default', // change if you have a different namespace
  });

  const workflowId = `${taskQueue.toUpperCase()}-${nanoid()}`;
  // just for this demo - cancel the workflow on Ctrl+C
  process.on('SIGINT', async () => {
    const client = new WorkflowClient();
    const handle = client.getHandle(workflowId);
    await handle.cancel();
    console.log(`\nCanceled Workflow ${handle.workflowId}`);
    process.exit(0);
  });
  // you cannot catch SIGKILL

  const handle = await client.start('updateStories', {
    workflowId,
    taskQueue,
    args, // type inference works! args: [name: string]
    // cronSchedule: '*/10 * * * *', // start every 10th minute
    // in practice, use a meaningful business id, eg customerId or transactionId
  });
  console.log(`Started workflow ${handle.workflowId}`);

  // optional: wait for client result
  try {
    await handle.result(); // await completion of Workflow, which doesn't happen since it's a cron Workflow
  } catch (err: any) {
    console.error(err.message + ':' + handle.workflowId);
  }
  // console.log(await handle.result()); // Hello, Temporal!
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
