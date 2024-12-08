const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const api = require('../handles/api');

module.exports = {
  name: 'ai',
  description: 'Get an AI-powered response to your query, including text and images.',
  usage: 'ai <question>\nExample: ai Describe a beautiful sunset.',
  author: 'Jay Mar',

  async execute(senderId, args, pageAccessToken) {
    const question = args.join(' ');

    if (!question || question.trim() === '') {
      await sendMessage(senderId, {
        text: '❗ Please provide a question or description for the AI.\n\nExample: ai Describe a beautiful sunset.'
      }, pageAccessToken);
      return;
    }

    const apiUrl = `${api.kaizen}/api/gpt-4o-pro?q=${encodeURIComponent(question)}&uid=${senderId}&imageUrl=true`;

    try {
      const response = await axios.get(apiUrl);

      if (response.data) {
        const { response: aiResponse } = response.data;

        if (aiResponse.startsWith('TOOL_CALL: generateImage')) {
          const imageUrlMatch = aiResponse.match(/\((https?:\/\/[^\s)]+)\)/);
          const imageUrl = imageUrlMatch ? imageUrlMatch[1] : null;

          if (imageUrl) {
            await sendMessage(senderId, {
              attachment: {
                type: 'image',
                payload: {
                  url: imageUrl,
                  is_reusable: true
                }
              }
            }, pageAccessToken);
          } else {
            await sendMessage(senderId, {
              text: '⚠️ Image generation was requested, but no valid image URL was found. Please try again.'
            }, pageAccessToken);
          }
        } else {
          await sendMessage(senderId, { text: aiResponse }, pageAccessToken);
        }
      } else {
        throw new Error('Invalid API response.');
      }
    } catch (error) {
      console.error('Error in AI command:', error.message || error);
      await sendMessage(senderId, {
        text: `⚠️ An error occurred while processing your request. You can try using "ai2" or retry the command.`
      }, pageAccessToken);
    }
  }
};
