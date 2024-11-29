const axios = require("axios");
const { sendMessage } = require('../handles/sendMessage');
const api = require('../handles/api');

module.exports = {
  name: "gpt4o",
  description: "Interact with GPT-4 using Kaizen's API and receive responses.",
  author: "chilli",

  async execute(chilli, args, kalamansi) {
    const prompt = args.join(" ");
    if (!prompt) {
      return sendMessage(chilli, {
        text: "❓ Please provide a question."
      }, kalamansi);
    }

    const apiUrl = `${api.kaizen}/api/gpt-4o`;

    try {
      const response = await axios.get(apiUrl, {
        params: {
          q: prompt,
          uid: 1
        }
      });

      const result = response.data.response;

      if (result) {
        await sendMessage(chilli, { text: result }, kalamansi);
      } else {
        throw new Error("Empty response from API.");
      }

    } catch (error) {
      const errorMessage = error.response?.data || error.message || "An unknown error occurred.";
      console.error("Error in AI command:", errorMessage);
      await sendMessage(chilli, {
        text: `⚠️ **API Error:**\n${JSON.stringify(errorMessage, null, 2)}`
      }, kalamansi);
    }
  }
};
