const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'quiz',
  description: 'Get a random multiple choice quiz',
  usage: 'quiz',
  author: 'chill',

  async execute(senderId, args, pageAccessToken) {
    try {
      const res = await axios.get('https://opentdb.com/api.php?amount=1&type=multiple');
      const data = res.data.results[0];

      const question = decodeHTMLEntities(data.question);
      const correct = decodeHTMLEntities(data.correct_answer);
      const incorrect = data.incorrect_answers.map(ans => decodeHTMLEntities(ans));

      const choices = [...incorrect, correct].sort(() => Math.random() - 0.5); // Shuffle choices

      const buttons = choices.slice(0, 4).map(choice => ({
        type: 'postback',
        title: choice,
        payload: choice === correct ? 'CORRECT_ANSWER' : 'WRONG_ANSWER'
      }));

      await sendMessage(senderId, {
        attachment: {
          type: 'template',
          payload: {
            template_type: 'button',
            text: `🧠 Quiz Time!\n\n${question}`,
            buttons
          }
        }
      }, pageAccessToken);
    } catch (error) {
      console.error("Quiz error:", error);
      await sendMessage(senderId, { text: '⚠️ Failed to fetch quiz. Try again.' }, pageAccessToken);
    }
  }
};

function decodeHTMLEntities(text) {
  return text.replace(/&quot;/g, '"')
             .replace(/&#039;/g, "'")
             .replace(/&amp;/g, '&')
             .replace(/&lt;/g, '<')
             .replace(/&gt;/g, '>');
}
