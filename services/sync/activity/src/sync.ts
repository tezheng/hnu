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

export async function pull(type: StoryType): Promise<number[]> {
  const storyIDs = await getStoryIDs(type);
  if (!storyIDs) {
    console.error(`Failed to fetch ${type}.`);
    return [];
  }

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
    return [];
  });

  const batches = ret[key];
  if (!batches) {
    throw new Error(`Failed to read last batch from db.`);
  }
  const lastIDs = batches.length > 0 ? batches[0].stories : [];

  const diffs = storyIDs.reduce((acc: number[], item: number) => {
    if (!lastIDs.includes(item)) {
      return [...acc, item];
    }
    return acc;
  }, []);

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
