const axios = require("axios");
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: "blackbox",
  description: "Interact with the Blackbox API and receive responses in a styled format.",
  author: "chilli",

  async execute(data, args, pageBot) {
    const prompt = args.join(" ");
    if (!prompt) return sendMessage(data, { text: `Please provide a question.\nex: blackbox who is your owner` }, pageBot);

    await sendMessage(data, { text: `✍️ Fetching response...` }, pageBot);
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      const response = await axios.get("https://betadash-api-swordslush.vercel.app/blackbox", {
        params: { ask: prompt }
      });

      const result = response.data.Response;
      const formattedResponse = `⎔ | 𝗕𝗟𝗔𝗖𝗞𝗕𝗢𝗫 𝗔𝗜\n━━━━━━━━━━━━\n${result}\n━━━━━━━━━━━━`;

      await sendConcatenatedMessage(data, formattedResponse, pageBot);

    } catch (error) {
      const errorMessage = error.response?.data?.message || "⚠️ An unexpected error occurred. Please try again.";
      sendMessage(data, { text: `⚠️ Error: ${errorMessage}` }, pageBot);
    }
  }
};

async function sendConcatenatedMessage(data, text, pageBot) {
  const maxMessageLength = 2000;
  const messages = splitMessageIntoChunks(text, maxMessageLength);
  
  for (const message of messages) {
    await new Promise(resolve => setTimeout(resolve, 300));
    await sendMessage(data, { text: message }, pageBot);
  }
}

function splitMessageIntoChunks(message, chunkSize) {
  const chunks = [];
  let currentChunk = "";

  message.split("\n").forEach(line => {
    if ((currentChunk + line + "\n").length > chunkSize) {
      chunks.push(currentChunk);
      currentChunk = "";
    }
    currentChunk += line + "\n";
  });

  if (currentChunk) chunks.push(currentChunk);
  return chunks;
}
