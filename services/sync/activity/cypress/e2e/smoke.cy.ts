// HACK! Workaround for env variables
// node-config need access env.NODE_CONFIG
// TODO find a proper place to assign cypress.env to process.env, maybe a plugin?
process.env.NODE_CONFIG = Cypress.env("NODE_CONFIG");

import { oldStories, newStories, diff } from '../../src/sync';

describe('Sync service smoke test', () => {
  it('Can get latest top story IDs', () => {
    cy.wrap(newStories('BestStory')).should('not.be.empty');
  });

  it('Can get latest best story IDs', () => {
    cy.wrap(newStories('TopStory')).should('not.be.empty');
  });

  it('Self diff is empty', () => {
    cy.wrap<Promise<number[]>, number[]>(newStories('BestStory')).then(stories => {
      cy.wrap(diff(stories, stories)).should('be.empty');
    })
  });

  it('Diff by empty equals self', async () => {
    const stories = await newStories('TopStory');
    cy.wrap(diff(stories, [])).should('eq', stories);
  });

  it('Pull off some items, the result should be what left over', () => {
    cy.wrap<Promise<number[]>, number[]>(newStories('TopStory')).then(stories => {
      const exclusion = stories.slice(10);
      const leftover = stories.slice(0, 10);
      cy.wrap(diff(stories, exclusion)).should('eq', leftover);
    })
  });
});
