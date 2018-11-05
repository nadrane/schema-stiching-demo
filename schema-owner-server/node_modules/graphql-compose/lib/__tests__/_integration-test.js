"use strict";

var _ = require("..");

beforeEach(() => {
  _.schemaComposer.clear();
});
describe('created types via TypeComposer.create should be avaliable in SDL', () => {
  it('simple case', () => {
    const UserTC = _.TypeComposer.create(`
      type User {
        name: String
      }
    `);

    const ArticleTC = _.TypeComposer.create(`
      type Article {
        text: String
        user: User
      }
    `);

    expect(ArticleTC.getFieldType('user')).toBe(UserTC.getType());
  });
  it('hoisting case', () => {
    const UserTC = _.TypeComposer.create({
      name: 'User',
      fields: {
        name: 'String',
        articles: '[Article]'
      }
    });

    const ArticleTC = _.TypeComposer.create({
      name: 'Article',
      fields: {
        text: 'String',
        user: 'User'
      }
    });

    expect(ArticleTC.getFieldType('user')).toBe(UserTC.getType());
    const ArticleList = UserTC.getFieldType('articles');
    expect(ArticleList.ofType).toBe(ArticleTC.getType());
  });
});