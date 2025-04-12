const axios = require("axios");
const { sendMessage } = require("../handles/sendMessage");

module.exports = {
  name: "openai",
  description: "Generate voice using Pollinations API with OpenAI audio",
  usage: "openai <text>",
  author: "chilli",

  execute: async function ({ event, args, senderId, pageAccessToken }) {
    if (!args || args.length === 0) {
      return sendMessage(senderId, {
        text: "Please enter the text you want to convert to voice.\nExample: openai What if you loved someone you’re not allowed to love?"
      }, pageAccessToken);
    }

    const query = args.join(" ");
    const encodedQuery = encodeURIComponent(query);
    const audioUrl = `https://text.pollinations.ai/${encodedQuery}?model=openai-audio&voice=ash`;

    try {
      const check = await axios.head(audioUrl);
      const type = check.headers['content-type'] || "";

      if (type.includes("audio")) {
        return sendMessage(senderId, {
          attachment: {
            type: "audio",
            payload: {
              url: audioUrl,
              is_reusable: true
            }
          }
        }, pageAccessToken);
      } else {
        return sendMessage(senderId, {
          text: "API did not return audio. Try different text."
        }, pageAccessToken);
      }
    } catch (err) {
      console.error("Error in openai command:", err.message);
      return sendMessage(senderId, {
        text: "An error occurred while generating the voice. Please try again later."
      }, pageAccessToken);
    }
  }
};
