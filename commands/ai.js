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
        await sendMessage(chilli, { text: `🎨 Generating image... Please wait.` }, kalamansi);

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
          await sendMessage(chilli, { text: result }, kalamansi);
        }
        
      } else if (result.includes('TOOL_CALL: browseWeb')) {
        await sendMessage(chilli, { text: `🌐 Browsing the web... Hold tight!` }, kalamansi);
        
        const browseData = result.replace('TOOL_CALL: browseWeb', '').trim();
        await sendMessage(chilli, { text: browseData }, kalamansi);

      } else {
        await sendMessage(chilli, { text: result }, kalamansi);
      }

    } catch (error) {
      sendMessage(chilli, {
        text: "⚠️ Error while processing your request. Please try again or use ai2 or blackbox or gpt4o"
      }, kalamansi);
    }
  }
};
