const axios = require("axios");
const fs = require("fs");
const path = require("path");
const FormData = require("form-data"); // ✅ Import correct FormData
const { sendMessage } = require("../handles/sendMessage");
const api = require("../handles/api");

module.exports = {
  name: "remini",
  description: "Enhance image quality using Zaik API.",
  usage: "Reply with 'remini' to enhance an image.",
  author: "chilli",

  async execute(senderId, args, pageAccessToken, event, imageUrl) {
    if (!imageUrl) {
      imageUrl = getAttachmentUrl(event) || (await getRepliedImage(event, pageAccessToken));
    }

    if (!imageUrl) {
      return sendMessage(senderId, {
        text: "❗ Please reply to an image or send an image with 'remini'."
      }, pageAccessToken);
    }

    console.log(`🔍 Image URL to Enhance: ${imageUrl}`);

    // Notify the user that the enhancement is in progress
    await sendMessage(senderId, { text: "⏳ Enhancing your image, please wait..." }, pageAccessToken);

    try {
      const apiUrl = `${api.zaik}/api/enhancev1?url=${encodeURIComponent(imageUrl)}`;
      console.log(`📡 Sending request to: ${apiUrl}`);

      const response = await axios.get(apiUrl, { responseType: "arraybuffer" });

      if (!response.data) {
        return sendMessage(senderId, { text: "⚠️ Enhancement failed. No valid image received." }, pageAccessToken);
      }

      // Save the enhanced image temporarily
      const filePath = path.join(__dirname, `enhanced_${Date.now()}.jpg`);
      fs.writeFileSync(filePath, response.data);
      console.log(`✅ Image saved temporarily: ${filePath}`);

      // Upload the enhanced image to Facebook
      const formData = new FormData();
      formData.append("message", "✨ Here's your enhanced image!");
      formData.append("source", fs.createReadStream(filePath)); // ✅ Correct form field for images

      const uploadResponse = await axios.post(
        `https://graph.facebook.com/v21.0/me/photos`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${pageAccessToken}`,
            ...formData.getHeaders(), // ✅ Fix the error here
          },
        }
      );

      console.log(`✅ Upload Response:`, uploadResponse.data);

      // Delete the temporary file after sending
      fs.unlinkSync(filePath);

    } catch (error) {
      console.error("❌ Error in Remini command:", error.response?.data || error.message || error);
      await sendMessage(senderId, { text: "⚠️ An error occurred. Please try again later." }, pageAccessToken);
    }
  }
};

function getAttachmentUrl(event) {
  const attachment = event.message?.attachments?.[0];
  return attachment?.type === "image" ? attachment.payload.url : null;
}

async function getRepliedImage(event, pageAccessToken) {
  if (event.message?.reply_to?.mid) {
    try {
      console.log(`🔄 Fetching replied image for MID: ${event.message.reply_to.mid}`);

      const { data } = await axios.get(`https://graph.facebook.com/v21.0/${event.message.reply_to.mid}/attachments`, {
        params: { access_token: pageAccessToken }
      });

      console.log(`📥 Facebook API Response:`, data);

      const imageData = data?.data?.[0]?.image_data;
      return imageData ? imageData.url : null;
    } catch (error) {
      console.error("❌ Error fetching replied image:", error.response?.data || error.message || error);
      return null;
    }
  }
  return null;
}
