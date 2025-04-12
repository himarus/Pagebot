const axios = require("axios");
const { sendMessage } = require("../handles/sendMessage");

module.exports = {
  name: "openai",
  description: "Generate voice using OpenAI audio via Pollinations API",
  usage: "openai <text>",
  author: "chilli",

  execute: async function ({ event, args, senderId, pageAccessToken }) {
    if (!args[0]) {
      return sendMessage(senderId, {
        text: "Please provide a question.\nExample: openai What if you fall for someone you're not allowed to love?"
      }, pageAccessToken);
    }

    const query = args.join(" ");
    const encodedText = encodeURIComponent(query);
    const audioUrl = `https://text.pollinations.ai/${encodedText}?model=openai-audio&voice=ash`;

    try {
      const checkAudio = await axios.head(audioUrl);
      const type = checkAudio.headers["content-type"] || "";

      if (type.includes("audio")) {
        await sendMessage(senderId, {
          attachment: {
            type: "audio",
            payload: {
              url: audioUrl,
              is_reusable: true
            }
          }
        }, pageAccessToken);
      } else {
        await sendMessage(senderId, {
          text: "No audio was returned from the API. Try again with a different message."
        }, pageAccessToken);
      }
    } catch (error) {
      console.error("Pollinations error:", error.message);
      await sendMessage(senderId, {
        text: "Something went wrong while accessing the audio. Please try again later."
      }, pageAccessToken);
    }
  },
};
