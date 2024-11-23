const axios = require('axios');
const { sendMessage, getRepliedImage } = require('../handles/sendMessage');

module.exports = {
  name: "remini",
  description: "Upscale an image using AI-powered API.",
  author: "YourName",

  async execute(senderId, args, pageAccessToken, event, imageUrl) {
    // Check for image input
    if (!imageUrl && !(event.message?.attachments && event.message.attachments[0]?.type === 'image')) {
      return sendMessage(senderId, {
        text: `📸 **How to Use Remini**:\n\n1️⃣ Reply to an image with 'remini'.\n2️⃣ Send an image with 'remini'.`
      }, pageAccessToken);
    }

    try {
      // Get the image URL if not passed explicitly
      if (!imageUrl) {
        if (event.message.reply_to && event.message.reply_to.mid) {
          imageUrl = await getRepliedImage(event.message.reply_to.mid, pageAccessToken);
        } else if (event.message?.attachments && event.message.attachments[0]?.type === 'image') {
          imageUrl = event.message.attachments[0].payload.url;
        }
      }

      if (!imageUrl) {
        return sendMessage(senderId, { text: "❗ Unable to retrieve the image URL. Please try again." }, pageAccessToken);
      }

      // Inform the user that the image is being processed
      await sendMessage(senderId, {
        text: "🔄 Processing your image with Remini... Please wait!"
      }, pageAccessToken);

      // Prepare API request
      const apiUrl = `https://jonellccapisbkup.gotdns.ch/api/upscale?url=${encodeURIComponent(imageUrl)}`;
      const response = await axios.get(apiUrl, { responseType: 'json' });

      // Check API response
      if (response.status === 200 && response.data?.output) {
        const processedImageUrl = response.data.output; // Extract the upscaled image URL

        // Send the processed image back to the user
        await sendMessage(senderId, {
          attachment: {
            type: "image",
            payload: {
              url: processedImageUrl,
              is_reusable: true
            }
          }
        }, pageAccessToken);
      } else {
        throw new Error("The API did not return a valid output. Please try again.");
      }
    } catch (error) {
      console.error("Error in Remini Command:", error.message || error);
      await sendMessage(senderId, {
        text: `⚠️ An error occurred while processing the image.\n\n**Error:** ${error.message || "Unknown error"}`
      }, pageAccessToken);
    }
  }
};
