import { addHtmlToEndOfUrl } from './getVideoData';

describe('URLs from the mobile web platform should be concatenated with .html', () => {
  it('concatenates mobile web URLs not ending in .html with .html', () => {
    expect(addHtmlToEndOfUrl('https://m.tiktok.com/v/6874583514088623365'))
      .toEqual('https://m.tiktok.com/v/6874583514088623365.html');
  });
  it('does not concatenate a mobile URL that already ends in .html', () => {
    expect(addHtmlToEndOfUrl('https://m.tiktok.com/v/6621886865379167494.html'))
      .toEqual('https://m.tiktok.com/v/6621886865379167494.html');
  });
});
