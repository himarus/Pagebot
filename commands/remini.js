const axios = require("axios");
const { sendMessage } = require("../handles/sendMessage");

module.exports = {
  name: "remini",
  description: "Enhance an image using the Kaiz Upscale API and upload to Imgur.",
  usage: "Reply to an image with 'remini' to enhance it.",
  author: "chilli pogi",

  async execute(chilli, pogi, accessToken, event) {
    // Retrieve the image URL from the message or the reply
    let imageUrl = getAttachmentUrl(event);

    if (!imageUrl) {
      imageUrl = await getRepliedImage(event, accessToken);
    }

    if (!imageUrl) {
      return sendMessage(
        chilli,
        {
          text: "❗ Please reply to an image with 'remini' to enhance it. Make sure to use Facebook Messenger for this feature.",
        },
        accessToken
      );
    }

    try {
      // Send a message to the user that the image is being enhanced
      await sendMessage(
        chilli,
        {
          text: "Enhancing the image, please wait... 🖼️",
        },
        accessToken
      );

      // Call the Kaizen API to get the enhanced image
      const apiUrl = `https://kaiz-apis.gleeze.com/api/upscale-v2?url=${encodeURIComponent(imageUrl)}`;
      const response = await axios.get(apiUrl);

      if (!response.data || !response.data.ImageUrl) {
        throw new Error("Invalid API response: Missing ImageUrl field.");
      }

      // Get the enhanced image URL
      const enhancedImageUrl = response.data.ImageUrl;

      // Upload the enhanced image to Imgur
      const imgurUrl = `https://betadash-uploader.vercel.app/imgur?link=${encodeURIComponent(enhancedImageUrl)}`;
      const imgurResponse = await axios.get(imgurUrl);

      if (!imgurResponse.data || imgurResponse.data.uploaded.status !== "success") {
        throw new Error("Imgur upload failed.");
      }

      // Get the final Imgur image URL
      const imgurImageUrl = imgurResponse.data.uploaded.image;

      // Send the uploaded Imgur image as an attachment
      await sendMessage(
        chilli,
        {
          attachment: {
            type: "image",
            payload: {
              url: imgurImageUrl, // Only one image URL should be sent
            },
          },
        },
        accessToken
      );
    } catch (error) {
      console.error("Error enhancing image:", error.message || error);
      await sendMessage(
        chilli,
        {
          text: "⚠️ An error occurred while enhancing the image. Please try again later.",
        },
        accessToken
      );
    }
  },
};

// Helper function to get the image URL from the message attachment
function getAttachmentUrl(event) {
  const attachment = event.message?.attachments?.[0];
  return attachment?.type === "image" ? attachment.payload.url : null;
}

// Helper function to get the replied image (if available)
async function getRepliedImage(event, accessToken) {
  if (event.message?.reply_to?.mid) {
    try {
      const { data } = await axios.get(`https://graph.facebook.com/v21.0/${event.message.reply_to.mid}/attachments`, {
        params: { access_token: accessToken },
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
