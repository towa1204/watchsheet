const sample = {
  channel: {
    name: 'Yutani Ch',
    description: 'ひとまず関西を中心に様々な場所を訪れ、\nいずれは日本中を旅しながら動画を撮れたら良いなと思います',
  },
  videos: [
    {
      title: '道頓堀のアレに今年も行ってきました',
      publishedAt: '2022/11/22',
      videoId: 'https://www.youtube.com/watch?v=gghuQ1VCa4U',
    },
    {
      title: '見せてもらおうか、動くガンダムの性能とやらを… 第3次スーパーロボコス大展',
      publishedAt: '2022/11/15',
      videoId: 'https://www.youtube.com/watch?v=I68MgfZsC6Q',
    },
    {
      title: '和歌浦の明光商店街と創業140年の本屋 まつき本店',
      publishedAt: '2022/11/08',
      videoId: 'https://www.youtube.com/watch?v=lop2fTND6G8',
    },
    {
      title: '和歌山に行って日本一のラーメン食べてきた',
      publishedAt: '2022/10/29',
      videoId: 'https://www.youtube.com/watch?v=hCdkm4lxLVA',
    },
    {
      title: '激シブ昭和レトロ！ 長吉銀座商店街',
      publishedAt: '2022/10/22',
      videoId: 'https://www.youtube.com/watch?v=_Fp8lCMlL0w',
    },
  ],
};

function main() {
  // const channelId = 'UC3jTHLb1p00XxwBTU2EilhA';
  // const channel = getWatchYouTubeChannel(channelId);
  // console.log(channel);

  console.log(sample);
}

/*
  次のオブジェクトを返す
  {
    channel: {
      name: string,
      description: string,
    }
    videos: {
      title: string,
      publishedAt: string,
      videoId: string,
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
      videoId: `https://www.youtube.com/watch?v=${item.snippet.resourceId.videoId}`,
    };
  });

  const channelInfo = {
    name: channel.items[0].snippet.title,
    description: channel.items[0].snippet.description,
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
