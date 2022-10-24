import { difference } from 'lodash';

import axios from 'axios';

import config from 'config';

import pluralize from 'pluralize';

import { getStoryIDs, StoryType } from '@tezheng/hackernews';

const endpoint = config.get<string>('GraphQLEndpoint');

async function gql(query: string) {
  return axios
    .post(
      endpoint,
      {
        query,
      },
      {
        headers: {
          contentType: 'application/json',
        },
      }
    )
    .then(res => res.data.data);
}

function lower(str: string) {
  return str.charAt(0).toLowerCase() + str.slice(1);
}

export async function oldStories(type: StoryType): Promise<number[]> {
  const key = pluralize(lower(type));
  const ret = await gql(`
    query {
      ${key}(take: 1, orderBy: { timestamp: desc }) {
        stories
      }
    }
  `)
  .catch((err) => {
    console.error(err);
    return {};
  });

  const batches = ret[key];

  return !batches
    ? null
    : batches.length > 0
      ? batches[0].stories
      : [];
}

export async function newStories(type: StoryType) {
  return getStoryIDs(type);
}

// return items in the candidates but not in exclution
export function diff(candidates: number[], exclusion: number[]) {
  return difference(candidates, exclusion);
  // return candidates.reduce((acc: number[], item: number) => {
  //   if (!exclusion.includes(item)) {
  //     return [...acc, item];
  //   }
  //   return acc;
  // }, []);
}

export async function pull(type: StoryType): Promise<number[]> {
  const lastIDs = await oldStories(type)
  if (!lastIDs) {
    console.error(`Failed to retrieve ${type} from db.`);
    return [];
  }

  const storyIDs = await newStories(type);
  if (!storyIDs) {
    console.error(`Failed to fetch ${type}.`);
    return [];
  }

  const diffs = diff(storyIDs, lastIDs);
  if (diffs.length == 0) {
    console.log('No new item.');
    return [];
  }

  try {
    await gql(`
      mutation {
        create${type}(data: {
          stories: ${JSON.stringify(storyIDs)}
        }) {
          timestamp
        }
      }
    `);
  } catch(err) {
    console.error(`Failed to persist new batch ${err}`);
  }

  console.log(`New items: ${JSON.stringify(diffs)}.`);

  return diffs;
};
