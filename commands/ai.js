const axios = require("axios");
const { sendMessage } = require('../handles/sendMessage');
const api = require('../handles/api');

module.exports = {
  name: "ai",
  description: "Interact with GPT-4 using Kaizen's API and receive responses.",
  author: "chilli",

  async execute(chilli, args, kalamansi) {
    const prompt = args.join(" ");
    if (!prompt) {
      return sendMessage(chilli, {
        text: `❓ **Please provide a question.**\n\n**Example:**\n\`ai what is chilli?\``
      }, kalamansi);
    }

    const apiUrl = `${api.kaizen}/api/gpt-4o`;

    try {
      // Directly fetch the response without showing a "Processing" message.
      const response = await axios.get(apiUrl, {
        params: {
          q: prompt,
          uid: 1
        }
      });

      const result = response.data.response;

      if (result) {
        const formattedResponse = `✨ **Chilli AI**\n━━━━━━━━━━━━\n${result}\n━━━━━━━━━━━━`;
        await sendMessage(chilli, { text: formattedResponse }, kalamansi);
      } else {
        throw new Error("Empty response from API.");
      }

    } catch (error) {
      console.error("Error in AI command:", error.response?.data || error.message || error);
      await sendMessage(chilli, {
        text: "⚠️ **An error occurred while processing your request. Please try again or use `ai2`.**"
      }, kalamansi);
    }
  }
};
