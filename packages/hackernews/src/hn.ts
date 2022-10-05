
import axios from 'axios';

import type { Story } from './types';

enum Method {
  BestStory = '/beststories.json',
  TopStory = '/topstories.json',
  NewStory = '/newstories.json',
  Item = '/item',
}

type StoryType = keyof typeof Method;

function url(strings: TemplateStringsArray, ...vals: string[]) {
  const endpoint = 'https://hacker-news.firebaseio.com/v0';
  let i = 0;
  let path = '';
  for (; i < vals.length; i += 1) {
    path += strings[i] + vals[i];
  }
  return endpoint + path + strings[i];
}

async function getStoryIDs(type: StoryType) {
  return await axios
    .get<number[]>(url`${Method[type]}`, { responseType: 'json' })
    .then(res => res.data)
}

async function fetchStory(storyID: number | string) {
  return await axios
    .get<Story>(url`${Method.Item}/${storyID.toString()}.json`, { responseType: 'json' })
    .then(res => res.data)
}

export {
  getStoryIDs,
  fetchStory,
};

export type {
  StoryType,
};
