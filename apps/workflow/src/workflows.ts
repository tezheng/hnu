
import { proxyActivities } from '@temporalio/workflow';

// Only import the activity types
import { activity as fetch } from '@hnu/fetch';
import { activity as sync } from '@hnu/sync';

import type { StoryType } from '@tezheng/hackernews';

interface activities {
  syncStories: sync,
  fetchStories: fetch,
};

const { syncStories, fetchStories } = proxyActivities<activities>({
  startToCloseTimeout: '1min',
  retry: {
    initialInterval: '1s',
    backoffCoefficient: 2,
    maximumAttempts: Infinity,
    maximumInterval: '2min',
    nonRetryableErrorTypes: [],
  },
});

/** A workflow that simply calls an activity */
export async function updateStories(name: StoryType) {
  const newItemIDs = await syncStories(name);
  const newStories = await fetchStories(name, newItemIDs);
  return newStories;
}
