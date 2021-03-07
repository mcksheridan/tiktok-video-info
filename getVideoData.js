/* eslint-disable no-param-reassign */
import https from 'follow-redirects/https';
import async from 'async';

const getVideoData = (req, res) => {
  const userInputVideoUrl = req.query.url;
  async.waterfall([
    function getRedirectedUrl(callback) {
      https.get(userInputVideoUrl, (response) => {
        const redirectedUrl = response.responseUrl;
        callback(null, redirectedUrl);
      });
    },
    function addRedirectedUrlToVideoData(redirectedUrl, callback) {
      const videoData = {};
      videoData.video_url = redirectedUrl;
      callback(null, videoData);
    },
    function getTikTokData(videoData, callback) {
      const TIKTOK_API = 'https://www.tiktok.com/oembed?url=';
      const videoUrlInTikTokApi = TIKTOK_API + videoData.video_url;
      https.get(videoUrlInTikTokApi, (response) => {
        response.on('data', (chunk) => {
          const tiktokData = JSON.parse(chunk);
          callback(null, videoData, tiktokData);
        });
      });
    },
    function addTikTokDataToVideoData(videoData, tiktokData, callback) {
      videoData.title = tiktokData.title;
      videoData.author_url = tiktokData.author_url;
      videoData.author_name = tiktokData.author_name;
      callback(null, videoData);
    },
    function displayVideoData(videoData) {
      res.json(videoData);
    },
  ]);
};

export { getVideoData as default };
