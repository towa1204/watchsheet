// テストするときはmain.jsのexport部分をコメントアウトすること

const main = require('../main');

const userSample = {
  channel: {
    name: 'Yutani Ch',
    description: 'ひとまず関西を中心に様々な場所を訪れ、\nいずれは日本中を旅しながら動画を撮れたら良いなと思います',
    url: 'https://youtube.com/channel/UC3jTHLb1p00XxwBTU2EilhA',
  },
  videos: [
    {
      title: '道頓堀のアレに今年も行ってきました',
      publishedAt: '2022/11/22',
      url: 'https://www.youtube.com/watch?v=gghuQ1VCa4U',
    },
    {
      title: '見せてもらおうか、動くガンダムの性能とやらを… 第3次スーパーロボコス大展',
      publishedAt: '2022/11/15',
      url: 'https://www.youtube.com/watch?v=I68MgfZsC6Q',
    },
    {
      title: '和歌浦の明光商店街と創業140年の本屋 まつき本店',
      publishedAt: '2022/11/08',
      url: 'https://www.youtube.com/watch?v=lop2fTND6G8',
    },
    {
      title: '和歌山に行って日本一のラーメン食べてきた',
      publishedAt: '2022/10/29',
      url: 'https://www.youtube.com/watch?v=hCdkm4lxLVA',
    },
    {
      title: '激シブ昭和レトロ！ 長吉銀座商店街',
      publishedAt: '2022/10/22',
      url: 'https://www.youtube.com/watch?v=_Fp8lCMlL0w',
    },
  ],
};

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
