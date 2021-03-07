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
    function sendRedirectedUrlToBrowser(redirectedUrl) {
      res.send(redirectedUrl);
    },
  ]);
};

export { getVideoData as default };
