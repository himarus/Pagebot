const axios = require("axios");
const { sendMessage } = require("../handles/sendMessage");

module.exports = {
  name: "remini",
  description: "Enhance an image using the Kaiz Upscale API and upload to Imgur.",
  usage: "Reply to an image with 'remini' to enhance it.",
  author: "chilli pogi",

  async execute(chilli, pogi, a, b) {
    let a = getAttachmentUrl(b);

    if (!a) {
      a = await getRepliedImage(b, a);
    }

    if (!a) {
      return sendMessage(
        chilli,
        {
          text: "❗ Please reply to an image with 'remini' to enhance it. Make sure to use Facebook Messenger for this feature.",
        },
        a
      );
    }

    try {
      await sendMessage(
        chilli,
        {
          text: "Enhancing the image, please wait... 🖼️",
        },
        a
      );

      const pogi = `https://kaiz-apis.gleeze.com/api/upscale-v2?url=${encodeURIComponent(a)}`;
      const b = await axios.get(pogi);

      if (!b.data || !b.data.ImageUrl) {
        throw new Error("Invalid API response: Missing ImageUrl field.");
      }

      const chilli = b.data.ImageUrl;

      const a = `https://betadash-uploader.vercel.app/imgur?link=${encodeURIComponent(chilli)}`;
      const b = await axios.get(a);

      if (!b.data || b.data.uploaded.status !== "success") {
        throw new Error("Imgur upload failed.");
      }

      const pogi = b.data.uploaded.image;

      await sendMessage(
        chilli,
        {
          attachment: {
            type: "image",
            payload: {
              url: pogi,
            },
          },
        },
        a
      );
    } catch (b) {
      console.error("Error enhancing image:", b.message || b);
      await sendMessage(
        chilli,
        {
          text: "⚠️ An error occurred while enhancing the image. Please try again later.",
        },
        a
      );
    }
  },
};

function getAttachmentUrl(b) {
  const pogi = b.message?.attachments?.[0];
  return pogi?.type === "image" ? pogi.payload.url : null;
}

async function getRepliedImage(b, a) {
  if (b.message?.reply_to?.mid) {
    try {
      const { data: pogi } = await axios.get(`https://graph.facebook.com/v21.0/${b.message.reply_to.mid}/attachments`, {
        params: { access_token: a },
      });
      const a = pogi?.data?.[0]?.image_data;
      return a ? a.url : null;
    } catch (chilli) {
      console.error("Error fetching replied image:", chilli.message || chilli);
      return null;
    }
  }
  return null;
}
