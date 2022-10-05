import { Context } from '@temporalio/activity';

import { fetch } from './fetch';

type argTypes = Parameters<typeof fetch>;

export async function fetchStories(type: argTypes[0], storyIDs: argTypes[1]) {
  const context = Context.current();
  return fetch(type, storyIDs, context.info.activityId);
}
