import { types } from '../src';

const Article = types.vo(
  {
    title: '',
    content: '',
  },
  {}
);

const ArticleApi = types.vo('', {
  computed: {
    titleLength() {
      return 0;
    },
  },
  methods: {
    load() {
      return true;
    },
  },
});

const ArticleViews = types.vo('', {
  computed: {
    titleLength() {
      return this.value.title.length;
    },
    contentLength() {
      return this.value.content.length;
    },
  },
});

describe('基本使用', () => {
  const ArticleAggregation = types.composeVo(Article, ArticleApi, ArticleViews);
  const template = {
    title: 'abc',
    content: '123456789',
  };
  const article = ArticleAggregation.create(template);

  it('compose不是类继承', () => {
    expect(ArticleAggregation.is(article)).toBe(true);
    expect(Article.is(article)).toBe(false);
    expect(ArticleApi.is(article)).toBe(false);
    expect(ArticleViews.is(article)).toBe(false);
  });

  it('实际值保存在value下', () => {
    expect(article.value).toBe(template);
    expect(article.title).toBeUndefined();
  });

  it('后面定义的methods和computed优先', () => {
    expect(article.titleLength).toBe('abc'.length);
    expect(article.contentLength).toBe('123456789'.length);
    expect(typeof article.load).toBe('function');
  });
});
