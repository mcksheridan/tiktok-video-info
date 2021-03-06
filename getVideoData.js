import https from 'follow-redirects/https';

const getVideoData = (req, res) => {
  const userInputVideoUrl = req.query.url;
  https.get(userInputVideoUrl, (response) => {
    const redirectedUrl = response.responseUrl;
    res.send(redirectedUrl);
  });
};

export { getVideoData as default };
