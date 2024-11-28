const axios = require("axios");
const { sendMessage } = require("../handles/sendMessage");
const api = require("../handles/api");

module.exports = {
  name: "blackbox",
  description: "Interact with the Blackbox GPT-4 API.",
  usage: "blackbox <your message>",
  author: "chilli",

  async execute(chilli, args, pageAccessToken) {
    const userInput = args.join(" ").trim();

    if (!userInput) {
      return sendMessage(chilli, {
        text: "❗ Usage: blackbox <your message>\nExample: blackbox How can I improve my coding skills?"
      }, pageAccessToken);
    }

    try {
      const apiUrl = `${api.kenlie}/blackbox-gpt4o/`;
      const { data } = await axios.get(apiUrl, {
        params: { text: userInput }
      });

      if (!data || !data.response) {
        return sendMessage(chilli, {
          text: "⚠️ Unable to process your request. Please try again."
        }, pageAccessToken);
      }

      const formattedResponse = `🔮| 𝘉𝘓𝘈𝘊𝘒𝘉𝘖𝘟\n━━━━━━━━━━━━\n${data.response}\n━━━━━━━━━━━━`;

      await sendMessage(chilli, { text: formattedResponse }, pageAccessToken);

    } catch (error) {
      console.error("Error in Blackbox command:", error.message || error);
      await sendMessage(chilli, {
        text: "⚠️ An error occurred. Please try again later."
      }, pageAccessToken);
    }
  }
};
