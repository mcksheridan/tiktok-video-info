/* eslint-disable no-param-reassign */
import https from 'follow-redirects/https';
import async from 'async';
import BigNumber from 'big-number';

export const addHtmlToEndOfUrl = (url) => {
  if (url.endsWith('html')) {
    return url;
  }
  const urlEndingWithHtml = `${url}.html`;
  return urlEndingWithHtml;
};

export const getVideoData = (req, res) => {
  const userInputVideoUrl = req.query.url;
  const redirectBlankQuery = () => {
    if (userInputVideoUrl === undefined) {
      res.send('Please enter a URL');
    }
  };
  redirectBlankQuery();
  async.waterfall([
    function getRedirectedUrl(callback) {
      try {
        https.get(userInputVideoUrl, (response) => {
          const redirectedUrl = response.responseUrl;
          callback(null, redirectedUrl);
        }).on('error', (error) => {
          // eslint-disable-next-line no-console
          console.error(error);
          res.status(500).send('There was a problem with the URL request');
        });
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);
        res.status(500).send('There was a problem with the URL you entered');
      }
    },
    function checkForMobileWebUrls(redirectedUrl, callback) {
      // URLs beginning with 'm' (i.e. https://m.tiktok.com/foo) receive a status code of 200.
      // As they do not have a redirect status code, follow redirects will return the input URL.
      // However, these URLs can not be used with the TikTok API (i.e. https://tiktok.com/oembed?url=bar)
      const mobileWebPattern = 'm.tiktok.com/v';
      if (userInputVideoUrl.includes(mobileWebPattern)) {
        const urlToExtractDataFrom = addHtmlToEndOfUrl(userInputVideoUrl);
        callback(null, urlToExtractDataFrom);
      } else {
        const urlToExtractDataFrom = redirectedUrl;
        callback(null, urlToExtractDataFrom);
      }
    },
    function saveRedirectedUrl(urlToExtractDataFrom, callback) {
      const videoData = {};
      videoData.video_url = urlToExtractDataFrom;
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
    function checkTikTokDataValidity(videoData, tiktokData, callback) {
      // TikTok can return a 200 response even when the video does not exist.
      if (tiktokData.title === undefined) {
        res.json(videoData);
      } else {
        callback(null, videoData, tiktokData);
      }
    },
    function saveTikTokData(videoData, tiktokData, callback) {
      videoData.title = tiktokData.title;
      videoData.author_url = tiktokData.author_url;
      videoData.author_name = tiktokData.author_name;
      callback(null, videoData);
    },
    function getTikTokId(videoData, callback) {
      const idRegexPattern = new RegExp(/\d+/);
      if (videoData.video_url.startsWith('https://m')) {
        const tiktokIdArray = videoData.video_url.match(idRegexPattern);
        const tiktokId = tiktokIdArray[0];
        callback(null, videoData, tiktokId);
      }
      if (videoData.video_url.startsWith('https://www')) {
        const videoRegexPattern = new RegExp(/video\/\d+/);
        const tiktokVideoPattern = videoData.video_url.match(videoRegexPattern);
        const tiktokVideoString = tiktokVideoPattern.toString();
        const tiktokIdArray = tiktokVideoString.match(idRegexPattern);
        const tiktokId = tiktokIdArray[0];
        callback(null, videoData, tiktokId);
      }
    },
    function saveTikTokId(videoData, tiktokId, callback) {
      videoData.video_id = tiktokId;
      callback(null, videoData);
    },
    function getBinaryId(videoData, callback) {
      const tiktokIdBigIntBinaryArray = [];
      const tiktokIdInteger = BigNumber(videoData.video_id);
      let currentInteger = tiktokIdInteger;
      while (currentInteger > BigNumber(0)) {
        const remainder = BigNumber(currentInteger).mod(2);
        const remainderString = remainder.toString();
        tiktokIdBigIntBinaryArray.unshift(remainderString);
        currentInteger = BigNumber(currentInteger).div(2);
        // eslint-disable-next-line eqeqeq
        if (currentInteger == 0) {
          const currentIntegerString = currentInteger.toString();
          tiktokIdBigIntBinaryArray.unshift(currentIntegerString);
        }
      }
      callback(null, videoData, tiktokIdBigIntBinaryArray);
    },
    function getThirtyTwoLeftBits(videoData, tiktokIdBigIntBinaryArray, callback) {
      const tiktokIdBinaryArray = tiktokIdBigIntBinaryArray.map((number) => parseInt(number, 10));
      const tiktokIdBinaryString = tiktokIdBinaryArray.join('');
      const thirtyTwoLeftBits = tiktokIdBinaryString.slice(0, 32);
      callback(null, videoData, thirtyTwoLeftBits);
    },
    function getDecimalFromBits(videoData, thirtyTwoLeftBits, callback) {
      const decimalArray = [];
      let arrayPlace = 0;
      let previousValue = 0;
      while (arrayPlace < 32) {
        const valueTotal = previousValue * 2;
        const bitAsInteger = parseInt(thirtyTwoLeftBits[arrayPlace], 10);
        const newTotal = bitAsInteger + valueTotal;
        decimalArray[0] = newTotal;
        previousValue = newTotal;
        arrayPlace += 1;
      }
      const decimal = decimalArray.toString();
      callback(null, videoData, decimal);
    },
    function getDateAdded(videoData, decimal, callback) {
      const dateAdded = new Date(decimal * 1000);
      callback(null, videoData, dateAdded);
    },
    function saveDateAdded(videoData, dateAdded, callback) {
      videoData.date_added = dateAdded;
      callback(null, videoData);
    },
    function displayVideoData(videoData) {
      res.json(videoData);
    },
  ]);
};
