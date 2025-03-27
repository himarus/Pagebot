const axios = require("axios");
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

    // Notify the user that the enhancement is in progress
    await sendMessage(senderId, { text: "⏳ Enhancing your image, please wait..." }, pageAccessToken);

    try {
      const apiUrl = `${api.zaik}/api/enhancev1?url=${encodeURIComponent(imageUrl)}`;
      const { data } = await axios.get(apiUrl);

      if (!data || !data.url) {
        return sendMessage(senderId, { text: "⚠️ Enhancement failed. Please try again later." }, pageAccessToken);
      }

      await sendMessage(senderId, {
        attachment: {
          type: "image",
          payload: { url: data.url }
        }
      }, pageAccessToken);

    } catch (error) {
      console.error("Error in Remini command:", error.message || error);
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
      const { data } = await axios.get(`https://graph.facebook.com/v21.0/${event.message.reply_to.mid}/attachments`, {
        params: { access_token: pageAccessToken }
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
