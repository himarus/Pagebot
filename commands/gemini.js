const axios = require("axios");
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: "gemini",
  description: "Analyze images or answer text-based queries using Gemini.",
  usage: "gemini <question> | [Attach or Reply to an image]",
  author: "chilli",

  async execute(senderId, args, pageAccessToken, event, imageUrl) {
    const userPrompt = args.join(" ").trim();

    // Display instructions if no prompt and no image are provided
    if (!userPrompt && !imageUrl && !getAttachmentUrl(event)) {
      return sendMessage(senderId, {
        text: `✨ How to Use:
1️⃣ Send an image with "gemini" + your question.
2️⃣ Reply to an image with "gemini" + your question.
3️⃣ Send "gemini" + your question for text-only queries.

Examples:
- gemini describe this
- [Reply to image:] gemini what's shown here.`
      }, pageAccessToken);
    }

    // Notify the user
    if (imageUrl || getAttachmentUrl(event)) {
      await sendMessage(senderId, { text: "🔍 Recognizing the image... Please wait." }, pageAccessToken);
    } else {
      await sendMessage(senderId, { text: "💬 Processing your question... One moment please." }, pageAccessToken);
    }

    // Handle image from reply or direct attachment
    if (!imageUrl) {
      imageUrl = getAttachmentUrl(event) || (await getRepliedImage(event, pageAccessToken));
    }

    try {
      // Build API request URL
      const apiUrl = `https://api.kenliejugarap.com/pixtral-paid/`;
      const apiParams = {
        question: userPrompt || "What is this image?",
        image_url: imageUrl || ""
      };

      // Make the API request
      const { data } = await axios.get(apiUrl, { params: apiParams });

      if (!data || !data.response) {
        return sendMessage(senderId, {
          text: "🚫 Unable to process your request. Please try again."
        }, pageAccessToken);
      }

      // Send the result
      await sendMessage(senderId, {
        text: `🎉 **Gemini Result:**\n\n${data.response}`
      }, pageAccessToken);

    } catch (error) {
      console.error("Error in Gemini command:", error.message || error);
      await sendMessage(senderId, {
        text: `⚠️ An error occurred: ${error.message || "Something went wrong. Please try again later."}`
      }, pageAccessToken);
    }
  }
};

// Helper: Get attachment URL from the event
function getAttachmentUrl(event) {
  const attachment = event.message?.attachments?.[0];
  return attachment?.type === "image" ? attachment.payload.url : null;
}

// Helper: Get image URL from a replied message
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
