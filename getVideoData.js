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
      const videoData = [{
        video_url: redirectedUrl,
      }];
      callback(null, videoData);
    },
    function displayVideoData(videoData) {
      res.json(videoData);
    },
  ]);
};

export { getVideoData as default };
