const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'quiz',
  description: 'Get a fun quiz question',
  usage: 'quiz',
  author: 'chill',

  async execute(senderId, args, pageAccessToken) {
    const apiUrl = 'https://betadash-api-swordslush-production.up.railway.app/quiz';

    try {
      await sendMessage(senderId, { sender_action: 'typing_on' }, pageAccessToken);

      const response = await axios.get(apiUrl);
      const quizData = response.data.questions[0];

      const choicesText = Object.entries(quizData.choices).map(([key, value]) => `${key}: ${value}`).join('\n');

      const message = {
        text: `📚 Category: ${quizData.category}\n🔄 Difficulty: ${quizData.difficulty}\n\n${quizData.question}\n\nChoices:\n${choicesText}`,
        quick_replies: [
          { content_type: "text", title: "Quiz Answer", payload: "QUIZ_ANSWER" }
        ]
      };

      await sendMessage(senderId, message, pageAccessToken);

    } catch (error) {
      console.error('Quiz error:', error);
      await sendMessage(senderId, {
        text: '⚠️ There was an issue with the quiz. Try again later!'
      }, pageAccessToken);
    }
  }
};
