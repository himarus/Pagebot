const axios = require("axios");
const api = require('../handles/api');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: "ai2",
  description: "Ask anything to Cleus AI",
  usage: "ai2 <question>",
  author: "churchill",

  async execute(senderId, args, pageAccessToken) {
    const question = args.join(" ");

    if (!question) {
      return sendMessage(senderId, {
        text: "Please provide a question. Example: ai2 What is love?"
      }, pageAccessToken);
    }

    try {
      const res = await axios.get(`${api.hazey}/api/cleus`, {
        params: { message: question }
      });

      const response = res.data?.cleus || "No response received.";

      await sendMessage(senderId, {
        text: response
      }, pageAccessToken);

    } catch (err) {
      console.error("AI2 Command Error:", err.message || err);
      await sendMessage(senderId, {
        text: "❌ Failed to get response from Cleus AI. Please try again later or try to use gemini."
      }, pageAccessToken);
    }
  }
};
