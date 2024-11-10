const axios = require("axios");
const { sendMessage } = require('../handles/sendMessage');
const api = require('../handles/api');

module.exports = {
  name: "ai",
  description: "Interact with GPT-4 using a custom API and receive responses, including images and browsing capabilities.",
  author: "chilli",

  async execute(chilli, args, kalamansi) {
    const prompt = args.join(" ");
    if (!prompt) {
      return sendMessage(chilli, { 
        text: `𝘗𝘭𝘦𝘢𝘴𝘦 𝘱𝘳𝘰𝘷𝘪𝘥𝘦 𝘢 𝘲𝘶𝘦𝘴𝘵𝘪𝘰𝘯.\n\n𝘌𝘹𝘢𝘮𝘱𝘭𝘦: 𝘈𝘪 𝘸𝘩𝘢𝘵 𝘪𝘴 𝘤𝘩𝘪𝘭𝘭𝘪` 
      }, kalamansi);
    }

    try {
      const response = await axios.get(`${api.jonelApi}/api/gpt4o-v2`, {
        params: { prompt: prompt }
      });

      const result = response.data.response;

      if (result.includes('TOOL_CALL: generateImage')) {
        await sendConcatenatedMessage(chilli, `🎨 Generating image... Please wait.`, kalamansi);

        const imageUrlMatch = result.match(/\!\[.*?\]\((https:\/\/.*?)\)/);
        
        if (imageUrlMatch && imageUrlMatch[1]) {
          const imageUrl = imageUrlMatch[1];

          await sendMessage(chilli, {
            attachment: {
              type: 'image',
              payload: {
                url: imageUrl
              }
            }
          }, kalamansi);
        } else {
          await sendConcatenatedMessage(chilli, result, kalamansi);
        }
        
      } else if (result.includes('TOOL_CALL: browseWeb')) {
        await sendConcatenatedMessage(chilli, `🌐 Browsing the web... Hold tight!`, kalamansi);
        
        const browseData = result.replace('TOOL_CALL: browseWeb', '').trim();
        await sendConcatenatedMessage(chilli, browseData, kalamansi);

      } else {
        await sendConcatenatedMessage(chilli, result, kalamansi);
      }

    } catch (error) {
      sendConcatenatedMessage(chilli, "⚠️ Error while processing your request. Please try again or use ai2 or gpt4o", kalamansi);
    }
  }
};

async function sendConcatenatedMessage(kupal, text, sili) {
  const maxMessageLength = 2000;

  if (text.length > maxMessageLength) {
    const messages = splitMessageIntoChunks(text, maxMessageLength);

    for (const message of messages) {
      await new Promise(resolve => setTimeout(resolve, 500));
      await sendMessage(kupal, { text: message }, sili);
    }
  } else {
    await sendMessage(kupal, { text }, sili);
  }
}

function splitMessageIntoChunks(mensahe, laki) {
  const chunks = [];
  for (let i = 0; i < mensahe.length; i += laki) {
    chunks.push(mensahe.slice(i, i + laki));
  }
  return chunks;
}
