const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const api = require('../handles/api');

async function waitForImageToBeReady(url, maxRetries = 15, delay = 3000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const res = await axios.head(url, { timeout: 10000 });
      if (res.status === 200) return true;
    } catch (err) {}
    await new Promise(res => setTimeout(res, delay));
  }
  return false;
}

module.exports = {
  name: 'poli',
  description: 'Generate an AI image using a prompt.',
  usage: 'poli <prompt>',
  author: 'chilli',

  async execute(senderId, args, pageAccessToken) {
    const prompt = args.join(' ');

    if (!prompt) {
      return sendMessage(senderId, {
        text: 'Please provide a prompt.\nExample: poli Dog'
      }, pageAccessToken);
    }

    await sendMessage(senderId, {
      text: `🎨 Generating image for:\n"${prompt}"\n\nPlease wait 30-45 seconds while we create your artwork...`
    }, pageAccessToken);

    const imageUrl = `${api.rapid}/api/pollinations?prompt=${encodeURIComponent(prompt)}`;

    const ready = await waitForImageToBeReady(imageUrl);
    if (!ready) {
      return sendMessage(senderId, {
        text: `⚠️ Image generation took too long. Try again later.\n\nPrompt: "${prompt}"`
      }, pageAccessToken);
    }

    try {
      await sendMessage(senderId, {
        attachment: {
          type: 'image',
          payload: { url: imageUrl }
        }
      }, pageAccessToken);
    } catch (error) {
      await sendMessage(senderId, {
        text: `⚠️ Failed to send image. Try again later.\n\nDirect link: ${imageUrl}`
      }, pageAccessToken);
    }
  }
};
