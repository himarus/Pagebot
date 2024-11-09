const axios = require("axios");
const { sendMessage } = require('../handles/sendMessage');
const api = require('../handles/api');

module.exports = {
  name: "uptime",
  description: "Monitor website uptime to keep it active 24/7.",
  author: "chilli",

  async execute(chilli, args, kalamansi) {
    const url = args[0];
    if (!url) {
      return sendMessage(chilli, { text: `⚠️ 𝘗𝘭𝘦𝘢𝘴𝘦 𝘱𝘳𝘰𝘷𝘪𝘥𝘦 𝘢 𝘸𝘦𝘣𝘴𝘪𝘵𝘦 𝘜𝘙𝘓 𝘵𝘰 𝘮𝘰𝘯𝘪𝘵𝘰𝘳.\n\nExample: 𝘶𝘱𝘵𝘪𝘮𝘦 https://example.com` }, kalamansi);
    }

    await sendMessage(chilli, { text: `🔍 Checking uptime for ${url}...` }, kalamansi);

    try {
      const response = await axios.get(`${api.jonelApi}/api/uptime`, {
        params: { url: url }
      });

      const result = response.data;

      if (result.success) {
        await sendMessage(chilli, {
          text: `✅ 𝘞𝘦𝘣𝘴𝘪𝘵𝘦 𝘮𝘰𝘯𝘪𝘵𝘰𝘳𝘪𝘯𝘨 𝘢𝘤𝘵𝘪𝘷𝘢𝘵𝘦𝘥!\n\n🔗 **URL**: ${result.monitoredUrl}\n🕒 𝘠𝘰𝘶𝘳 𝘴𝘪𝘵𝘦 𝘪𝘴 𝘯𝘰𝘸 𝘮𝘰𝘯𝘪𝘵𝘰𝘳𝘦𝘥 𝘵𝘰 𝘳𝘶𝘯 24/7!`
        }, kalamansi);
      } else {
        await sendMessage(chilli, { text: `⚠️ 𝘍𝘢𝘪𝘭𝘦𝘥 𝘵𝘰 𝘢𝘤𝘵𝘪𝘷𝘢𝘵𝘦 𝘶𝘱𝘵𝘪𝘮𝘦 𝘧𝘰𝘳 ${url}. 𝘗𝘭𝘦𝘢𝘴𝘦 𝘤𝘩𝘦𝘤𝘬 𝘺𝘰𝘶𝘳 𝘜𝘙𝘓 𝘢𝘯𝘥 𝘵𝘳𝘺 𝘢𝘨𝘢𝘪𝘯.` }, kalamansi);
      }

    } catch (error) {
      sendMessage(chilli, { text: "⚠️ Error while processing your uptime request. Please try again or contact support." }, kalamansi);
    }
  }
};
