const axios = require("axios");
const { sendMessage, getRepliedImage } = require('../handles/sendMessage'); // Importing getRepliedImage directly

module.exports = {
  name: "remini",
  description: "Enhance an image using the Remini API.",
  author: "Churchill",

  async execute(senderId, args, pageAccessToken, event, imageUrl) {
    if (!imageUrl) {
      // Use the getRepliedImage function from sendMessage if replying to a message
      if (event.message.reply_to && event.message.reply_to.mid) {
        imageUrl = await getRepliedImage(event.message.reply_to.mid, pageAccessToken);
      } else if (event.message?.attachments && event.message.attachments[0]?.type === 'image') {
        imageUrl = event.message.attachments[0].payload.url;
      }
    }

    if (!imageUrl) {
      return sendMessage(senderId, { text: "Please send an image first then type 'remini to enhance it' or reply to an image with 'remini' to enhance it." }, pageAccessToken);
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
