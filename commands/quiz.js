const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'quiz',
  description: 'Get a fun quiz question',
  usage: 'quiz',
  author: 'yazky',

  async execute(senderId, args, pageAccessToken) {
    const apiUrl = 'https://betadash-api-swordslush-production.up.railway.app/quiz';

    try {
      await sendMessage(senderId, { sender_action: 'typing_on' }, pageAccessToken);

      const response = await axios.get(apiUrl);
      const quizData = response.data.questions[0];

      const quickReplies = Object.entries(quizData.choices).map(([key, value]) => ({
        content_type: "text",
        title: `${key}: ${value}`,
        payload: `QUIZ_ANSWER|${key}|${quizData.correct_answer}`
      }));

      const message = {
        text: `📚 Category: ${quizData.category}\n🔄 Difficulty: ${quizData.difficulty}\n\n${quizData.question}`,
        quick_replies: quickReplies.slice(0, 11) 
      };

      await sendMessage(senderId, message, pageAccessToken);

      await sendMessage(senderId, {
        attachment: {
          type: 'audio',
          payload: {
            url: 'https://gamma.123tokyo.xyz/get.php/c/b2/eOKLFwPBBsI.mp3?n=%F0%9F%93%BA%20Family%20Feud%20Round%20Win%20Sound%20Effect%20%F0%9F%93%BA%20Game%20Show%20Sound%20Effects%20%E2%9C%85%20FREE%20TO%20USE%20%E2%9C%85&uT=R&uN=c3Ryb21mYXV6aWU%3D&h=tx-l9651m1qHbnjMKIePEA&s=1744220605&uT=R&uN=c3Ryb21mYXV6aWU%3D'
          }
        }
      }, pageAccessToken);

    } catch (error) {
      console.error('Quiz error:', error);
      await sendMessage(senderId, {
        text: '⚠️ There was an issue with the quiz. Try again later!'
      }, pageAccessToken);
    }
  }
};
