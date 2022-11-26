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

// 動画のURLからvideoIdを抜き出す関数
function getVideoIdfromVideoURL(videoURL) {
  const result = /^https:\/\/www\.youtube\.com\/watch\?v=(.+)$/.exec(videoURL);
  if (result == null) return null;
  return /\&/.exec(result[1]) == null ? result[1] : result[1].split('&')[0];
}

function InputVideolURL() {
  const input = Browser.inputBox(
    "YouTubeチャンネルの適当な動画のURLを入力してください．\nURLの形式は'https://www.youtube.com/watch?v='です．",
    Browser.Buttons.OK_CANCEL
  );
  if (input === 'cancel') return;

  const videoId = getVideoIdfromVideoURL(input);
  if (videoId == null) {
    Browser.msgBox("入力した文字列がURLの形式'https://www.youtube.com/watch?v='と一致しません．");
    return;
  }
  console.log(videoId);
}

function main() {
  // const channelId = 'UC3jTHLb1p00XxwBTU2EilhA';
  // const user = getWatchYouTubeChannel(channelId);
  // console.log(channel);
  user = userSample;

  const template = [
    ['channel', 'description', 'url', 'comment', '', ''],
    ['', '', '', '', '', ''],
    ['', '', '', '', '', ''],
    ['posted date', 'title', 'url', 'views', 'rating', 'impression'],
  ];
  // チャンネル表のデータを埋め込む
  template[1] = [user.channel.name, user.channel.description, user.channel.url, '', '', ''];
  // ビデオ表のデータを埋め込む
  template.push(
    ...user.videos.map((video) => {
      return [video.publishedAt, video.title, video.url, 0, '', ''];
    })
  );

  // シートの作成
  const SpreadSheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = SpreadSheet.insertSheet();
  sheet.setName(user.channel.name);
  // const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Yutani Ch');

  const ROWNUM = template.length; // チャンネル・動画の表を含む行数
  const COLUMNNUM = template[0].length; // チャンネル・動画の表を含む列数
  const VIDEOSROWNUM = 4; // 動画のプロパティを表す列番号

  // チャンネル・動画の表を作成
  sheet.getRange(1, 1, ROWNUM, COLUMNNUM).setValues(template);

  // 動画の表にフィルタを適用
  sheet.getRange(VIDEOSROWNUM, 1, user.videos.length + 1, COLUMNNUM).createFilter();
  sheet.getFilter().sort(1, true); // 日付を基準に昇順に並べる

  // 表のプロパティを中央寄せ
  sheet.getRange(1, 1, 1, COLUMNNUM).setHorizontalAlignment('center');
  sheet.getRange(VIDEOSROWNUM, 1, 1, COLUMNNUM).setHorizontalAlignment('center');

  // 列幅を自動調節（効いてないっぽい）
  sheet.autoResizeColumns(1, COLUMNNUM);
}

/*
  次のオブジェクトを返す
  {
    channel: {
      name: string,
      description: string,
      url: string,
    }
    videos: {
      title: string,
      publishedAt: string,
      url: string,
    }[]
  }
 */
function getWatchYouTubeChannel(channelId) {
  const MAX = 50;

  // すべての動画をもつプレイリストIDを取得
  const channel = YouTube.Channels.list('snippet,contentDetails', { id: channelId });
  const playlistId = channel.items[0].contentDetails.relatedPlaylists.uploads;
  console.log(playlistId);

  let token = null,
    items = [],
    requestNum = 0;
  // 複数回リクエストして全動画の情報を格納する
  while (true) {
    const playlist = requestPlaylistItems(playlistId, token, MAX);
    items = [...items, ...playlist.items];

    token = playlist.nextPageToken;
    requestNum++;
    if (token == null) break;

    /* エラー対策 */
    if (requestNum > playlist.pageInfo.totalResults / playlist.pageInfo.resultsPerPage) break;

    /* 調整 */
    if (requestNum == 1) break;
  }
  console.log(`APIへのリクエスト回数：${requestNum}`);
  console.log(`動画数：${items.length}`);

  // 取得したデータから [タイトル，投稿日，動画URL] の配列 を作る
  const videoInfo = items.map((item) => {
    return {
      title: item.snippet.title,
      publishedAt: new Date(item.snippet.publishedAt).toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }),
      url: `https://www.youtube.com/watch?v=${item.snippet.resourceId.videoId}`,
    };
  });

  const channelInfo = {
    name: channel.items[0].snippet.title,
    description: channel.items[0].snippet.description,
    url: `https://www.youtube.com/channel/${channelId}`,
  };

  return {
    channel: channelInfo,
    videos: videoInfo,
  };
}

function requestPlaylistItems(playlistId, token, max) {
  let requestOptions = {
    maxResults: max,
    playlistId: playlistId,
  };
  if (token) requestOptions.pageToken = token;
  console.log(requestOptions);

  return YouTube.PlaylistItems.list('snippet', requestOptions);
}

// jest用
// exports.getVideoIdfromVideoURL = getVideoIdfromVideoURL;
