const axios = require("axios");
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: "blackbox",
  description: "Fetches essay-style responses from Blackbox API",
  author: "chilli",

  async execute(chilli, args, kalamansi) {
    const query = args.join(" ");
    if (!query) {
      return sendMessage(chilli, { text: `Please provide a questio..\n\nExample: blackbox write an essay about love` }, kalamansi);
    }

    await sendMessage(chilli, { text: `✍️ 𝘞𝘳𝘪𝘵𝘪𝘯𝘨 𝘺𝘰𝘶𝘳 𝘢𝘯𝘴𝘸𝘦𝘳...` }, kalamansi);
    await new Promise(resolve => setTimeout(resolve, 500));  // Delay for user feedback

    try {
      const response = await axios.get("https://kaiz-apis.gleeze.com/api/blackbox", {
        params: { q: query, uid: 199 }
      });

      const result = response.data.response;
      await sendConcatenatedMessage(chilli, result, kalamansi);

    } catch (error) {
      sendMessage(chilli, { text: "⚠️ Error while processing your request. Please try again." }, kalamansi);
    }
  }
};

async function sendConcatenatedMessage(chilli, text, kalamansi) {
  const maxMessageLength = 2000;

  if (text.length > maxMessageLength) {
    const messages = splitMessageIntoChunks(text, maxMessageLength);

    for (const message of messages) {
      await new Promise(resolve => setTimeout(resolve, 300));  // Delay between chunks
      await sendMessage(chilli, { text: message }, kalamansi);
    }
  } else {
    await sendMessage(chilli, { text }, kalamansi);
  }
}

function splitMessageIntoChunks(message, chunkSize) {
  const chunks = [];
  for (let i = 0; i < message.length; i += chunkSize) {
    chunks.push(message.slice(i, i + chunkSize));
  }
  return chunks;
}
