/*
Welcome to the schema! The schema is the heart of Keystone.

Here we define our 'lists', which will then be used both for the GraphQL
API definition, our database tables, and our Admin UI layout.

Some quick definitions to help out:
A list: A definition of a collection of fields with a name. For the starter
  we have `User`, `Post`, and `Tag` lists.
A field: The individual bits of data on your list, each with its own type.
  you can see some of the lists in what we use below.

*/

// Like the `config` function we use in keystone.ts, we use functions
// for putting in our config so we get useful errors. With typescript,
// we get these even before code runs.
import { list } from '@keystone-6/core';

// We're using some common fields in the starter. Check out https://keystonejs.com/docs/apis/fields#fields-api
// for the full list of fields.
import {
  text,
  json,
  integer,
} from '@keystone-6/core/fields';

import { Lists } from '.keystone/types';

// We have a users list, a blogs list, and tags for blog posts, so they can be filtered.
// Each property on the exported object will become the name of a list (a.k.a. the `listKey`),
// with the value being the definition of the list, including the fields.
const stories = list({
  fields: {
    storyID: integer({ isIndexed: 'unique' }),
    title: text({ validation: { isRequired: true } }),
    url: text(),
    score: integer({ isIndexed: true }),
    publishedAt: integer({ isIndexed: true }),
    meta: json(),
    context: text({ isIndexed: true }),
    createdAt: integer({ validation: { isRequired: true } }),
  },
  db: {
    idField: { kind: 'cuid' },
  },
  // Here we can configure the Admin UI. We want to show a user's name and posts in the Admin UI
  ui: {
    listView: {
      initialColumns: ['storyID', 'title'],
    },
  },
});

export const lists: Lists = {
  BestStory: stories,
  TopStory: stories,
};
