const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const api = require('../handles/api');

module.exports = {
  name: 'aidetect',
  description: 'Detect if the given text is AI-generated or human-written using Yakzy\'s AI Detector.',
  usage: 'aidetect <text>\nExample: aidetect This is a test message.',
  author: 'chill',

  async execute(senderId, args, pageAccessToken) {
    const text = args.join(' ');

    if (!text || text.trim() === '') {
      await sendMessage(senderId, {
        text: '📝 Please provide a text to analyze.\n\nExample: aidetect This is a test message.'
      }, pageAccessToken);
      return;
    }

    const apiUrl = `${api.yakzy}/aidetect?text=${encodeURIComponent(text)}`;

    try {
      const response = await axios.get(apiUrl);

      if (response.data && response.data.data) {
        const { isHuman, feedback, additional_feedback, detected_language, textWords, aiWords } = response.data.data;

        const resultMessage = 
          `📊 AI Detection Result:\n` +
          `📝 *Original Text:* ${text}\n` +
          `🤖 AI Probability: *${100 - isHuman}%*\n` +
          `🧑 Human Probability: *${isHuman}%*\n` +
          `🔠 AI Words: *${aiWords}* | Human Words: *${textWords}*\n` +
          `🌍 Detected Language: *${detected_language === 'un' ? 'Unknown' : detected_language}*\n` +
          `📌 Feedback: *${feedback}*\n` +
          `ℹ️ Additional Info: *${additional_feedback}*`;

        await sendMessage(senderId, { text: resultMessage }, pageAccessToken);
      } else {
        throw new Error('Invalid API response.');
      }
    } catch (error) {
      console.error('Error in AI Detect command:', error.message || error);
      await sendMessage(senderId, {
        text: `⚠️ An error occurred while analyzing the text. Please try again later.`
      }, pageAccessToken);
    }
  }
};
