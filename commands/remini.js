const axios = require('axios');
const { sendMessage, getRepliedImage } = require('../handles/sendMessage');

module.exports = {
  name: "remini",
  description: "Upscale an image using AI-powered API.",
  usage: `remini\n\nHow to use:\n1️⃣ Reply to an image with 'remini'.\n2️⃣ Send an image with 'remini'.`,
  author: "YourName",

  async execute(senderId, args, pageAccessToken, event, imageUrl) {
    // Check if image URL or replied image exists
    if (!imageUrl && !(event.message?.attachments && event.message.attachments[0]?.type === 'image')) {
      return sendMessage(senderId, {
        text: `📸 How to Use Remini:\n\n1️⃣ Reply to an image with 'remini'.\n2️⃣ Send an image with 'remini'.`
      }, pageAccessToken);
    }

    try {
      // Get image URL from a reply or directly attached image
      if (!imageUrl) {
        if (event.message.reply_to && event.message.reply_to.mid) {
          imageUrl = await getRepliedImage(event.message.reply_to.mid, pageAccessToken);
        } else if (event.message?.attachments && event.message.attachments[0]?.type === 'image') {
          imageUrl = event.message.attachments[0].payload.url;
        }
      }

      // Notify the user
      await sendMessage(senderId, {
        text: "🔄 Processing the image with Remini... Please wait."
      }, pageAccessToken);

      // API request to upscale the image
      const apiUrl = `https://jonellccapisbkup.gotdns.ch/api/upscale?url=${encodeURIComponent(imageUrl)}`;
      const response = await axios.get(apiUrl);

      // Send the result
      const upscaleUrl = response.data.url || apiUrl; // Assume response contains 'url'
      await sendMessage(senderId, {
        attachment: {
          type: "image",
          payload: {
            url: upscaleUrl,
            is_reusable: true
          }
        }
      }, pageAccessToken);

    } catch (error) {
      console.error("Error in Remini command:", error.message || error);
      await sendMessage(senderId, {
        text: "⚠️ An error occurred while processing the image. Please try again later."
      }, pageAccessToken);
    }
  }
};
