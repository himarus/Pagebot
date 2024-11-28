const axios = require("axios");
const { sendMessage } = require('../handles/sendMessage');
const api = require('../handles/api');

module.exports = {
  name: "gemini",
  description: "Interact with an API for image recognition or text-based queries.",
  author: "Churchill",

  async execute(senderId, args, pageAccessToken, event, imageUrl) {
    const userPrompt = args.join(" ");

    if (!userPrompt && !imageUrl) {
      return sendMessage(senderId, { 
        text: `✨ **How to Use:**
1️⃣ **Send an image with** \`gemini + question\`.
2️⃣ **Reply to an image with** \`gemini + question\`.
3️⃣ **Send** \`gemini + question\` **for text-only queries.**

**Examples:**
- \`gemini describe this\`
- [Reply to image:] \`gemini what's shown here?\`` 
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

      if (!imageUrl) {
        throw new Error("No image URL provided.");
      }

      const apiUrl = `${api.kenlie}/pixtral-paid/`;
      const encodedImageUrl = encodeURIComponent(`${imageUrl}|${imageUrl}`);
      const response = await axios.get(apiUrl, {
        params: {
          question: userPrompt,
          image_url: encodedImageUrl
        }
      });

      if (response.data && response.data.status) {
        const result = response.data.response;
        const formattedResponse = `🧩 **Gemini AI**\n━━━━━━━━━━━━━━\n${result}\n━━━━━━━━━━━━━`;
        await sendMessage(senderId, { text: formattedResponse }, pageAccessToken);
      } else {
        throw new Error("API returned an invalid response.");
      }

    } catch (error) {
      console.error("Error in Gemini command:", error.response?.data || error.message);
      await sendMessage(senderId, {
        text: "⚠️ **An error occurred while processing your request. Please try again or use `ai2`.**"
      }, pageAccessToken);
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
