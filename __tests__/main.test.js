// テストするときはmain.jsのexport部分をコメントアウトすること

const main = require('../main');

const url_id_pair = [
  ['https://www.youtube.com/watch?v=TBn_Zopxk9I', 'TBn_Zopxk9I'],
  ['https://www.youtube.com/watch?v=gghuQ1VCa4U&t=21s', 'gghuQ1VCa4U'],
  ['https://www.youtube.com/watch?v=CQ1F6LaIpug&list=PL_zqfBigax6v9isyw4yZ4EL61rpFwyc-2&index=1', 'CQ1F6LaIpug'],
  ['aiueo', null],
  ['https://www.youtube.com/watch?v=', null],
];

url_id_pair.forEach((pair) => {
  test(`${pair[0]} -> ${pair[1]}`, () => {
    expect(main.getVideoIdfromVideoURL(pair[0])).toBe(pair[1]);
  });
});
