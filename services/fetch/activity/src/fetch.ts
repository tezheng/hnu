import axios from 'axios';

import { chunk, flatten } from 'lodash';

import pluralize from 'pluralize';

import { fetchStory, StoryType } from '@tezheng/hackernews';

import config from 'config';

const endpoint = config.get<string>('GraphQLEndpoint');

// TODO: end point
async function gql<T>(query: string, variables?: object): Promise<{
  result?: T,
  error?: Error,
}> {
  return axios
    .post<{ data: T }>(
      endpoint,
      {
        query,
        variables,
      },
      {
        headers: {
          contentType: 'application/json',
        },
      }
    )
    .then(res => ({ result: res.data.data }))
    .catch(error => ({ error }));
}

function lower(str: string) {
  return str.charAt(0).toLowerCase() + str.slice(1);
}

async function getExistingStories(type: string, storyIDs: number[]) {
  const key = pluralize(lower(type));
  const { result, error } = await gql(`
    query {
      ${key}(where: { storyID: { in: ${JSON.stringify(storyIDs)} }}) {
        storyID
      }
    }
  `)

  if (error) {
    console.error('Failed to query from database.');
    throw error;
  }

  const stories = (result as any)[key];
  return stories as { storyID: number }[];
}

export async function fetch(type: StoryType, storyIDs: number[], context?: any) {
  console.log(`Story IDs: ${JSON.stringify(storyIDs)}`);
  console.log(`Context: ${context ? context.toString() : null}`);

  const existingStories = await getExistingStories(type, storyIDs);
  const existingIDs = existingStories.map(item => item.storyID);
  const newIDs = storyIDs.reduce(
    (acc: typeof storyIDs, id) => existingIDs.includes(id) ? acc : [...acc, id],
    []
  );

  console.log(`New story IDs: ${JSON.stringify(newIDs)}`);

  // TODO error handling
  const newStories = await Promise.all(newIDs.map(i => fetchStory(i)));
  console.log(JSON.stringify(newStories));

  const key = `create${pluralize(type)}`;
  const newRecords = flatten(await Promise.all(
    chunk(newStories, 10).map(async arr => {
      const input = arr.map(story => {
        const { id, score, time, title, url, ...meta } = story!;
        return {
          storyID: id,
          context: context.toString(),
          score,
          publishedAt: time,
          createdAt: Math.round(Date.now() / 1000),
          title,
          url,
          meta,
        };
      });
      const { result, error } = await gql<{ createStories: { id: string }[]}>(
        `mutation ${key}($input: [${type}CreateInput!]!) {
          ${key}(data: $input) {
            id
          }
        }`,
        {
          input
        }
      );

      if (error) {
        console.error('Failed to persist stories.');
        throw error;
      }

      const data = (result as any)[key];
      return input.map(({ title, url, score }, i) => ({
        id: data[i] ? data[i].id : null,
        title,
        url,
        score,
      }));
    })
  ));
  console.log(JSON.stringify(newRecords, null, 2));

  return newRecords;
}
