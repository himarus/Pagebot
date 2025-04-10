const axios = require('axios');
const { sendMessage } = require("../handles/sendMessage");

module.exports = {
  name: "tiktokdl",
  description: "Download TikTok video using a link",
  usage: "tiktokdl <tiktok link>",
  author: "chilli",

  execute: async function ({ args, event, api, senderId, pageAccessToken }) {
    const link = args[0];
    if (!link || !link.includes("tiktok.com")) {
      return sendMessage(senderId, {
        text: "Please provide a valid TikTok link.\nExample: tiktokdl https://www.tiktok.com/@user/video/123456789"
      }, pageAccessToken);
    }

    // Send "Downloading..." indicator
    await sendMessage(senderId, {
      text: "Downloading TikTok video, please wait..."
    }, pageAccessToken);

    try {
      const res = await axios.post("https://www.tikwm.com/api/", { url: link }, {
        headers: {
          'User-Agent': 'Mozilla/5.0',
          'Content-Type': 'application/json',
        }
      });

      const data = res.data.data;
      const video = await axios.get(data.play, { responseType: 'stream' });

      sendMessage(senderId, {
        text: `✅ TikTok Download Successful!\n\nTitle: ${data.title}\nLikes: ${data.digg_count}\nComments: ${data.comment_count}`,
        attachment: {
          type: "video",
          payload: {
            is_reusable: true,
            filedata: video.data
          }
        }
      }, pageAccessToken);
    } catch (e) {
      sendMessage(senderId, {
        text: "An error occurred while downloading the video. Please try again later."
      }, pageAccessToken);
    }
  }
};
