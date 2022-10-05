import { bundleWorkflowCode, Worker } from '@temporalio/worker';

(async function () {
  const { code } = await bundleWorkflowCode({
    workflowsPath: require.resolve('../src/workflows'),
  });
  console.log(code);
  // await writeFile(path.join(__dirname, 'workflow-bundle.js'), code);
})();
