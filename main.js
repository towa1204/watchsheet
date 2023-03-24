function InputVideoURL() {
  const url = Browser.inputBox(
    `YouTubeチャンネルの適当な動画のURLを入力してください.\\n
     URLの形式は'https://www.youtube.com/watch?v='です.`,
    Browser.Buttons.OK_CANCEL
  );
  if (url === 'cancel') return;

  const videoId = extractVideoId(url);
  if (videoId == null) {
    Browser.msgBox("入力した文字列がURLの形式'https://www.youtube.com/watch?v='と一致しません．");
    return;
  }
  const channelId = fetchChannelId(videoId);

  if (getChannelTableSheet(channelId) == null) {
    initChannelTable(channelId);
  } else {
    updateChannelTable(channelId);
  }
}

// channelIdをもとに，すでにシートが存在するかチェック
function getChannelTableSheet(channelId) {
  const SpreadSheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheets = SpreadSheet.getSheets();
  for (let sheet of sheets) {
    if (sheet.getRange('B2').getValue() === `https://www.youtube.com/channel/${channelId}`) {
      return sheet;
    }
  }
  return null;
}

function initChannelTable(channelId) {
  // const channelId = 'UC3jTHLb1p00XxwBTU2EilhA';
  const user = getWatchYouTubeChannel(channelId);
  // console.log(channel);
  // user = userSample;

  const template = [
    ['channel', 'url', 'comment', '', '', ''],
    ['', '', '', '', '', ''],
    ['', '', '', '', '', ''],
    ['posted date', 'title', 'url', 'views', 'rating', 'impression'],
  ];
  // チャンネル表のデータを埋め込む
  template[1] = [user.channel.name, user.channel.url, '', '', '', ''];
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

function updateChannelTable(channelId) {
  const sheet = getChannelTableSheet(channelId);
  const filter = sheet.getFilter();
  if (filter == null) {
    Browser.msgBox('フィルターが設定されていません.');
    return;
  }
  const range = filter.getRange();
  console.log(
    `フィルタの範囲 左上: (${range.getRow()}, ${range.getColumn()}), 左下: (${range.getLastRow()}, ${range.getLastColumn()})`
  );

  // フィルタ範囲の値を取り出して日付でソートし最新のvideoidを取得する
  const videos = range.getValues();
  videos.shift(); // 表の項目の配列を削除
  videos.sort((a, b) => {
    return a[0] < b[0] ? 1 : -1;
  });
  const latestVideoId = extractVideoId(videos[0][2]);
  console.log(`更新前の最新のvideoid: ${latestVideoId}`);

  // urlと一致するものが見つかれば，それまでの配列を返し，見つからなければエラー
  const newVideoInfo = getDiffVideos(channelId, latestVideoId);
  console.log(`新しく追加する動画数: ${newVideoInfo.length}`);

  if (newVideoInfo.length === 0) {
    Browser.msgBox('すでに最新です.');
    return;
  } else if (latestVideoId == null) {
    Browser.msgBox('エラーが発生しました.');
    return;
  }

  // シートの末尾に動画の情報を追加(フィルタは自動で適用される)
  sheet.getRange(range.getLastRow() + 1, range.getColumn(), newVideoInfo.length, range.getLastColumn()).setValues(
    newVideoInfo.map((video) => {
      return [video.publishedAt, video.title, video.url, 0, '', ''];
    })
  );
}

/*
  次のオブジェクトを返す
  {
    channel: {
      name: string,
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
    // if (requestNum == 1) break;
  }
  console.log(`APIへのリクエスト回数: ${requestNum}`);
  console.log(`動画数: ${items.length}`);

  // 取得したデータから [タイトル，投稿日，動画URL] の配列 を作る
  // 配列の要素の順序は日付が古いものから新しいもの順
  const videoInfo = items
    .map((item) => {
      return {
        title: item.snippet.title,
        publishedAt: new Date(item.snippet.publishedAt).toLocaleDateString('ja-JP', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        }),
        url: `https://www.youtube.com/watch?v=${item.snippet.resourceId.videoId}`,
      };
    })
    .reverse();

  const channelInfo = {
    name: channel.items[0].snippet.title,
    url: `https://www.youtube.com/channel/${channelId}`,
  };

  return {
    channel: channelInfo,
    videos: videoInfo,
  };
}

// videoIdの動画より新しい動画の情報を取得
function getDiffVideos(channelId, videoId) {
  const MAX = 50;

  // すべての動画をもつプレイリストIDを取得
  const channel = YouTube.Channels.list('snippet,contentDetails', { id: channelId });
  const playlistId = channel.items[0].contentDetails.relatedPlaylists.uploads;
  // console.log(playlistId);

  let token = null,
    items = [],
    requestNum = 0;
  while (true) {
    const playlist = requestPlaylistItems(playlistId, token, MAX);
    items = [...items, ...playlist.items];

    for (let i = items.length - playlist.items.length; i < items.length; i++) {
      if (items[i].snippet.resourceId.videoId == videoId) {
        return items
          .slice(0, i)
          .map((item) => {
            return {
              title: item.snippet.title,
              publishedAt: new Date(item.snippet.publishedAt).toLocaleDateString('ja-JP', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
              }),
              url: `https://www.youtube.com/watch?v=${item.snippet.resourceId.videoId}`,
            };
          })
          .reverse();
      }
    }

    token = playlist.nextPageToken;
    requestNum++;
    if (token == null) break;

    /* エラー対策 */
    if (requestNum > playlist.pageInfo.totalResults / playlist.pageInfo.resultsPerPage) break;

    /* 調整 */
    // if (requestNum == 1) break;
  }
  return null;
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
