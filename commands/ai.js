const axios = require("axios");
const api = require('../handles/api');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: "ai",
  description: "Ask anything to Gemini AI",
  usage: "ai <question>",
  author: "churchill",

  async execute(senderId, args, pageAccessToken) {
    const question = args.join(" ");

    if (!question) {
      return sendMessage(senderId, {
        text: "Please provide a question. Example: ai What is the capital of France?"
      }, pageAccessToken);
    }

    try {
      const res = await axios.get(`${api.yakzy}/gemini-1.5-pro`, {
        params: { ask: question }
      });

      const aiText = res.data?.response || "No response received.";

      await sendMessage(senderId, {
        text: aiText
      }, pageAccessToken);

    } catch (err) {
      console.error("AI Command Error:", err.message || err);
      await sendMessage(senderId, {
        text: "❌ Failed to get AI response. Please try again later or try to use ai2"
      }, pageAccessToken);
    }
  }
};
