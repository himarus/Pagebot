const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { default: Axios } = require("axios");
const { sendMessage } = require("../handles/sendMessage");

module.exports = {
  name: "openai",
  description: "Generate voice using OpenAI audio via Pollinations API",
  usage: "openai <text>",
  author: "chilli",

  execute: async function ({ event, args, senderId, pageAccessToken }) {
    if (!args[0]) {
      return sendMessage(senderId, { text: "Please provide text to generate voice.\nExample: openai What if you fall for someone you're not allowed to love?" }, pageAccessToken);
    }

    const text = encodeURIComponent(args.join(" "));
    const url = `https://text.pollinations.ai/${text}?model=openai-audio&voice=ash`;

    try {
      const response = await Axios({
        url,
        method: "GET",
        responseType: "arraybuffer",
        headers: {
          "Content-Type": "audio/mpeg",
        },
      });

      const filePath = path.join(__dirname, "audio.mp3");
      fs.writeFileSync(filePath, response.data);

      const messageData = {
        attachment: {
          type: "audio",
          payload: {
            is_reusable: true,
          },
        },
        filedata: fs.createReadStream(filePath),
      };

      await sendMessage(senderId, messageData, pageAccessToken);
      fs.unlinkSync(filePath);
    } catch (error) {
      console.error("Error fetching voice audio:", error.message);
      return sendMessage(senderId, { text: "Something went wrong while fetching the audio." }, pageAccessToken);
    }
  },
};
