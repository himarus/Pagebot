const axios = require("axios");
const { sendMessage } = require("../handles/sendMessage");

module.exports = {
  name: "remini",
  description: "Enhance an image using the Kaiz Upscale API.",
  usage: "Reply to an image with 'remini' to enhance it.",
  author: "chilli",

  async execute(senderId, args, pageAccessToken, event) {
    let imageUrl = getAttachmentUrl(event);

    // If no image is attached, try to get it from the replied message
    if (!imageUrl) {
      imageUrl = await getRepliedImage(event, pageAccessToken);
    }

    // If still no image, notify the user
    if (!imageUrl) {
      return sendMessage(
        senderId,
        {
          text: "❗ Please reply to an image with 'remini' to enhance it, use fb messenger to see reply button",
        },
        pageAccessToken
      );
    }

    try {
      // Notify the user that the image is being processed
      await sendMessage(
        senderId,
        {
          text: "Enhancing the image, please wait... 🖼️",
        },
        pageAccessToken
      );

      // Send the image to the Kaiz Upscale API
      const apiUrl = `https://kaiz-apis.gleeze.com/api/upscale-v2?url=${encodeURIComponent(imageUrl)}`;
      const { data } = await axios.get(apiUrl);

      if (data && data.url) {
        // Send back the enhanced image
        await sendMessage(
          senderId,
          {
            attachment: {
              type: "image",
              payload: {
                url: data.url,
              },
            },
          },
          pageAccessToken
        );
      } else {
        throw new Error("Invalid API response");
      }
    } catch (error) {
      console.error("Error enhancing image:", error.message || error);
      await sendMessage(
        senderId,
        {
          text: "⚠️ An error occurred while enhancing the image. Please try again later.",
        },
        pageAccessToken
      );
    }
  },
};

// Helper function to get the direct attachment URL
function getAttachmentUrl(event) {
  const attachment = event.message?.attachments?.[0];
  return attachment?.type === "image" ? attachment.payload.url : null;
}

// Helper function to get the image URL from a replied message
async function getRepliedImage(event, pageAccessToken) {
  if (event.message?.reply_to?.mid) {
    try {
      const { data } = await axios.get(`https://graph.facebook.com/v21.0/${event.message.reply_to.mid}/attachments`, {
        params: { access_token: pageAccessToken },
      });
      const imageData = data?.data?.[0]?.image_data;
      return imageData ? imageData.url : null;
    } catch (error) {
      console.error("Error fetching replied image:", error.message || error);
      return null;
    }
  }
  return null;
}
