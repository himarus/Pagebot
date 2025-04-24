const axios = require("axios");
const { sendMessage } = require('../handles/sendMessage');
const api = require('../handles/api');

module.exports = {
  name: "quiz",
  description: "Send a multiple choice quiz from Rapido API",
  usage: "quiz",
  author: "churchill",

  async execute(senderId, args, pageAccessToken) {
    try {
      const res = await axios.get(`${api.rapid}/quiz`);
      const { operator, question, options, correct_answer } = res.data;

      const buttons = options.map(option => ({
        type: "postback",
        title: option,
        payload: `quiz_answer::${option}::${correct_answer}`
      }));

      await sendMessage(senderId, {
        text: `❓ ${question}\n\nOperator: ${operator}`,
        quick_replies: buttons.map(btn => ({
          content_type: "text",
          title: btn.title,
          payload: btn.payload
        }))
      }, pageAccessToken);

    } catch (err) {
      console.error("Error in quiz command:", err.message || err);
      await sendMessage(senderId, {
        text: `⚠️ Failed to load quiz. Please try again later.`
      }, pageAccessToken);
    }
  }
};
