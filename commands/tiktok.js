const axios = require("axios");
const { sendMessage } = require('../handles/sendMessage');

const tiktokRegex = /^https?:\/\/(www\.)?(tiktok\.com|vt\.tiktok\.com|vm\.tiktok\.com)\/.+$/;

module.exports = {
  name: 'tiktok',
  description: 'Download TikTok videos or images',
  usage: 'tiktok <url> | [generic]\nExample: tiktok https://tiktok.com/... | generic',
  author: 'Deku',

  async execute(senderId, args, pageAccessToken) {
    const input = args.join(" ").split("|").map(part => part.trim());
    const url = input[0];
    const mode = input[1]?.toLowerCase();

    // Validate URL
    if (!url || !tiktokRegex.test(url)) {
      await sendMessage(senderId, { text: "Please provide a valid TikTok URL!" }, pageAccessToken);
      return;
    }

    try {
      // API request
      const { data } = await axios.post(
        "https://tikwm.com/api/",
        `url=${encodeURIComponent(url)}&count=12&cursor=0&web=1&hd=1`,
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      );

      // Handle API errors
      if (data.code !== 0 || !data.data) {
        await sendMessage(senderId, { text: "Invalid response from API. Please check the link!" }, pageAccessToken);
        return;
      }

      const { title, hdplay, images } = data.data;

      // Handle image posts
      if (images?.length > 0) {
        if (mode === "generic") {
          // Generic template for multiple images
          const elements = images.slice(0, 10).map((img, index) => ({
            title: `Image ${index + 1}`,
            image_url: img,
            subtitle: title || "TikTok Image",
            buttons: [{
              type: "web_url",
              url: img,
              title: "View Full"
            }]
          }));

          await sendMessage(senderId, { 
            text: "Note: In generic mode, only the first 10 images will be shown." 
          }, pageAccessToken);

          await sendMessage(senderId, {
            attachment: {
              type: "template",
              payload: {
                template_type: "generic",
                elements: elements
              }
            }
          }, pageAccessToken);
        } else {
          // Send images individually
          for (const img of images) {
            await sendMessage(senderId, {
              attachment: {
                type: "image",
                payload: { url: img }
              }
            }, pageAccessToken);
          }
        }
        await sendMessage(senderId, { text: `Title: ${title}` }, pageAccessToken);
        return;
      }

      // Handle video posts
      if (hdplay) {
        await sendMessage(senderId, {
          attachment: {
            type: "video",
            payload: { url: `https://tikwm.com${hdplay}` }
          }
        }, pageAccessToken);

        await sendMessage(senderId, { text: `Title: ${title}` }, pageAccessToken);
        return;
      }

      // Fallback response
      await sendMessage(senderId, { text: "No valid content found in the response." }, pageAccessToken);

    } catch (err) {
      console.error("TikTok command error:", err);
      await sendMessage(senderId, { 
        text: `Error: ${err.message || "Failed to process TikTok content"}`
      }, pageAccessToken);
    }
  }
};
