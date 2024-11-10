const axios = require("axios");
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: "remini",
  description: "Enhance an image using the Remini API.",
  author: "Churchill",

  async execute(senderId, args, pageAccessToken, event, imageUrl) {
    if (!imageUrl) {
      if (event.message.reply_to && event.message.reply_to.mid) {
        imageUrl = await getRepliedImage(event.message.reply_to.mid, pageAccessToken);
      } else if (event.message?.attachments && event.message.attachments[0]?.type === 'image') {
        imageUrl = event.message.attachments[0].payload.url;
      }
    }

    if (!imageUrl) {
      return sendMessage(senderId, { text: "Please provide an image or reply to an image with 'remini' to enhance it." }, pageAccessToken);
    }

    sendMessage(senderId, { text: "Enhancing image... 🔄" }, pageAccessToken);

    try {
      const apiUrl = `https://xnilnew404.onrender.com/xnil/remini?imageUrl=${encodeURIComponent(imageUrl)}`;
      await sendMessage(senderId, { 
        attachment: { 
          type: 'image', 
          payload: { url: apiUrl } 
        } 
      }, pageAccessToken);
      
    } catch (error) {
      console.error("Error in Remini command:", error);
      sendMessage(senderId, { text: `Error: ${error.message || "Something went wrong."}` }, pageAccessToken);
    }
  }
};

async function getRepliedImage(mid, pageAccessToken) {
  const { data } = await axios.get(`https://graph.facebook.com/v21.0/${mid}/attachments`, {
    params: { access_token: pageAccessToken }
  });

  if (data && data.data.length > 0 && data.data[0].image_data) {
    return data.data[0].image_data.url;
  } else {
    return "";
  }
}
