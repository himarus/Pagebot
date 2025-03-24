const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

const intervals = {}; // Store user intervals

module.exports = {
  name: "test",
  description: "Sends a random Chilli video with an optional interval",
  author: "Chilli",

  async execute(senderId, args, pageAccessToken) {
    if (args[0] && /^[0-9]+[mh]$/.test(args[0])) {
      const timeValue = parseInt(args[0]);
      const timeUnit = args[0].slice(-1);

      let intervalMs;
      if (timeUnit === 'm') {
        intervalMs = timeValue * 60 * 1000; // Convert minutes to milliseconds
      } else if (timeUnit === 'h') {
        intervalMs = timeValue * 60 * 60 * 1000; // Convert hours to milliseconds
      }

      if (intervals[senderId]) {
        clearInterval(intervals[senderId]); // Clear existing interval
      }

      intervals[senderId] = setInterval(async () => {
        await sendShoti(senderId, pageAccessToken);
      }, intervalMs);

      return sendMessage(senderId, {
        text: `✅ | Shoti will be sent every ${timeValue} ${timeUnit === 'm' ? 'minute(s)' : 'hour(s)'}.`
      }, pageAccessToken);
    }

    if (args[0] && args[0].toLowerCase() === 'stop') {
      if (intervals[senderId]) {
        clearInterval(intervals[senderId]);
        delete intervals[senderId];
        return sendMessage(senderId, { text: "⛔ | Shoti interval stopped." }, pageAccessToken);
      }
      return sendMessage(senderId, { text: "❌ | No active shoti interval to stop." }, pageAccessToken);
    }

    await sendShoti(senderId, pageAccessToken);
  }
};

async function sendShoti(senderId, pageAccessToken) {
  try {
    const response = await axios.get('https://betadash-shoti-yazky.vercel.app/shotizxx?apikey=shipazu');
    const { shotiurl: videoUrl, username, nickname, duration } = response.data;

    await sendMessage(senderId, {
      text: `Username: ${username}\nNickname: ${nickname}\nDuration: ${duration} seconds`
    }, pageAccessToken);

    await sendMessage(senderId, {
      attachment: {
        type: "video",
        payload: {
          url: videoUrl
        }
      }
    }, pageAccessToken);
  } catch (error) {
    console.error("Failed to fetch the Chilli video:", error);
    sendMessage(senderId, {
      text: `Failed to fetch the Chilli video. Error: ${error.message || "Unknown error"}`
    }, pageAccessToken);
  }
}
