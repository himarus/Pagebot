const axios = require('axios');
const { sendMessage, getRepliedImage } = require('../handles/sendMessage');

module.exports = {
  name: "remini",
  description: "Upscale an image using AI-powered API.",
  author: "YourName",

  async execute(senderId, args, pageAccessToken, event, imageUrl) {
    if (!imageUrl && !(event.message?.attachments && event.message.attachments[0]?.type === 'image')) {
      return sendMessage(senderId, {
        text: `📸 How to Use Remini:\n\n1️⃣ Reply to an image with 'remini'.\n2️⃣ Send an image first then type 'remini'.`
      }, pageAccessToken);
    }

    try {
      if (!imageUrl) {
        if (event.message.reply_to && event.message.reply_to.mid) {
          imageUrl = await getRepliedImage(event.message.reply_to.mid, pageAccessToken);
        } else if (event.message?.attachments && event.message.attachments[0]?.type === 'image') {
          imageUrl = event.message.attachments[0].payload.url;
        }
      }

      await sendMessage(senderId, {
        text: "🔄 Processing the image with Remini... Please wait."
      }, pageAccessToken);

      const apiUrl = `https://jonellccapisbkup.gotdns.ch/api/upscale?url=${encodeURIComponent(imageUrl)}`;
      const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });

      const imageBuffer = Buffer.from(response.data, 'binary');
      const base64Image = `data:image/jpeg;base64,${imageBuffer.toString('base64')}`;

      await sendMessage(senderId, {
        attachment: {
          type: "image",
          payload: {
            url: base64Image,
            is_reusable: true
          }
        }
      }, pageAccessToken);
    } catch (error) {
      await sendMessage(senderId, {
        text: "⚠️ An error occurred while processing the image. Please try again later."
      }, pageAccessToken);
    }
  }
};
