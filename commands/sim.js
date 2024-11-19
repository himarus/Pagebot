const axios = require("axios");
const { sendMessage } = require('../handles/sendMessage');
const api = require('../handles/api');

module.exports = {
  name: "sim",
  description: "SimSimi reply on command with AI Voice integration",
  usage: "sim <message>\nExample: sim Hello, how are you?",
  author: "chilli",
  async execute(senderId, args, pageAccessToken) {
    if (!args || args.length === 0) {
      await sendMessage(senderId, {
        text: "Please provide a message.\n\nExample: sim kupal kaba?"
      }, pageAccessToken);
      return;
    }

    const content = encodeURIComponent(args.join(" "));
    const simApiUrl = `https://hiroshi-api.onrender.com/other/sim?ask=${content}`;

    try {
      const res = await axios.get(simApiUrl);
      const respond = res.data.answer;

      if (res.data.error) {
        await sendMessage(senderId, {
          text: `⚠️ Error: ${res.data.error}`
        }, pageAccessToken);
        return;
      }

      if (typeof respond === "string") {
      
        await sendMessage(senderId, {
          text: respond
        }, pageAccessToken);

        
        const voiceId = 8; // Default voice ID
        const voiceApiUrl = `${api.joshWebApi}/api/aivoice?q=${encodeURIComponent(respond)}&id=${voiceId}`;

        try {
          
          await axios.get(voiceApiUrl, { responseType: 'arraybuffer' });

          await sendMessage(senderId, {
            attachment: {
              type: 'audio',
              payload: {
                url: voiceApiUrl,
                is_reusable: true
              }
            }
          }, pageAccessToken);
        } catch (voiceError) {
          console.error("Error in AI Voice generation:", voiceError.message || voiceError);
          await sendMessage(senderId, {
            text: "⚠️ An error occurred while generating the voice clip. Please try again later."
          }, pageAccessToken);
        }
      } else {
        await sendMessage(senderId, {
          text: "⚠️ Received an unexpected response from the API."
        }, pageAccessToken);
      }
    } catch (error) {
      console.error("Error in Sim command:", error.message || error);
      await sendMessage(senderId, {
        text: "⚠️ An error occurred while processing your request. Please try again later."
      }, pageAccessToken);
    }
  }
};
