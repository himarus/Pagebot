const axios = require("axios");
const { sendMessage } = require("../handles/sendMessage");
const api = require("../handles/api");

module.exports = {
  name: "ai",
  description: "Interact with AI for text-based queries, image recognition, browsing, and image generation.",
  author: "chilli",

  async execute(senderId, args, pageAccessToken, event) {
    const prompt = args.join(" ");
    let imageUrl = null;

    if (!prompt) {
      return sendMessage(senderId, {
        text: `❓ **Please provide a question.**\n\n**Example Usage:**\n- \`ai what is this?\`\n- Reply to an image: \`ai describe this\`\n- \`ai generate an image of a sunset\``,
      }, pageAccessToken);
    }

    // Check for replied image
    if (event.message?.reply_to?.mid) {
      try {
        imageUrl = await getRepliedImage(event.message.reply_to.mid, pageAccessToken);
      } catch (error) {
        return sendMessage(senderId, {
          text: `⚠️ Unable to fetch the replied image. Please try again.`,
        }, pageAccessToken);
      }
    }

    // Check for image in the attachments
    if (!imageUrl && event.message?.attachments && event.message.attachments[0]?.type === "image") {
      imageUrl = event.message.attachments[0].payload.url;
    }

    try {
      const apiUrl = `${api.jonelApi}/api/gpt4o-v2`;
      const params = imageUrl ? { prompt, imageUrl } : { prompt };

      const response = await axios.get(apiUrl, { params });
      const result = response.data.response;

      // Handle Image Generation
      if (result.includes("TOOL_CALL: generateImage")) {
        await sendMessage(senderId, { text: `🎨 Generating image... Please wait.` }, pageAccessToken);

        const imageUrlMatch = result.match(/\!\[.*?\]\((https:\/\/.*?)\)/);
        if (imageUrlMatch && imageUrlMatch[1]) {
          const generatedImageUrl = imageUrlMatch[1];

          await sendMessage(senderId, {
            attachment: {
              type: "image",
              payload: {
                url: generatedImageUrl,
              },
            },
          }, pageAccessToken);
        } else {
          await sendMessage(senderId, { text: result }, pageAccessToken);
        }
      }

      // Handle Web Browsing
      else if (result.includes("TOOL_CALL: browseWeb")) {
        await sendMessage(senderId, { text: `🌐 Browsing the web... Hold tight!` }, pageAccessToken);

        const browseData = result.replace("TOOL_CALL: browseWeb", "").trim();
        await sendMessage(senderId, { text: browseData }, pageAccessToken);
      }

      // Handle Text or Analyzed Image Response
      else {
        await sendMessage(senderId, { text: result }, pageAccessToken);
      }

    } catch (error) {
      console.error("Error in AI command:", error);
      sendMessage(senderId, {
        text: `⚠️ An error occurred while processing your request. Please try again later.`,
      }, pageAccessToken);
    }
  },
};

async function getRepliedImage(mid, pageAccessToken) {
  const { data } = await axios.get(`https://graph.facebook.com/v21.0/${mid}/attachments`, {
    params: { access_token: pageAccessToken },
  });

  if (data?.data?.length > 0 && data.data[0]?.payload?.url) {
    return data.data[0].payload.url;
  } else {
    throw new Error("No image found in the replied message.");
  }
}
