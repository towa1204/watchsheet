// videoidからchannelidをAPI経由で取得
function fetchChannelId(videoId) {
  const video = YouTube.Videos.list('snippet', { id: videoId });
  return video.items[0].snippet.channelId;
}

// 動画URLからvideoidを抜き出す. 動画URLの形式にマッチしないときはnullを返す
function extractVideoId(videoURL) {
  const result = /^https:\/\/www\.youtube\.com\/watch\?v=(.+)$/.exec(videoURL);
  if (result == null) return null;
  return /\&/.exec(result[1]) == null ? result[1] : result[1].split('&')[0];
}

// jest用
// exports.extractVideoId = extractVideoId;
