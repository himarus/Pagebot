const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

const pageId = '493920247130641';
const adminId = '8731046750250922';
const excludedIds = []; // List of excluded PSIDs, if any

// Function to fetch all PSIDs
async function getAllPSIDs(pageAccessToken) {
  try {
    let psids = [];
    let nextPage = `https://graph.facebook.com/v21.0/${pageId}/conversations?fields=participants&access_token=${pageAccessToken}`;
    
    while (nextPage) {
      const response = await axios.get(nextPage);
      if (response.data?.data) {
        response.data.data.forEach(convo => {
          convo.participants.data.forEach(participant => {
            if (participant.id !== pageId && !excludedIds.includes(participant.id)) {
              psids.push(participant.id);
            }
          });
        });
        nextPage = response.data.paging?.next || null;
      } else {
        break;
      }
    }
    return psids;
  } catch (error) {
    console.error('Error fetching PSIDs:', error.message || error);
    return [];
  }
}

// Function to send notifications to all users
async function sendNotificationToAllUsers(message, pageAccessToken) {
  const users = await getAllPSIDs(pageAccessToken);
  
  for (const psid of users) {
    try {
      await axios.post(`https://graph.facebook.com/v21.0/me/messages?access_token=${pageAccessToken}`, {
        recipient: { id: psid },
        message: { text: `📢 Notification from Admin: ${message}` },
      });
    } catch (error) {
      console.error(`Error sending notification to user ${psid}:`, error.message || error);
    }
  }
}

module.exports = {
  name: 'sendnoti',
  description: 'Send a notification to all users who have messaged the page.',
  author: 'Cliff',
  usage: 'sendnoti <message>',

  async execute(senderId, args, pageAccessToken) {
    if (senderId !== adminId) {
      await sendMessage(senderId, { text: "❗ This command is restricted to the page admin." }, pageAccessToken);
      return;
    }

    const message = args.join(' ').trim();
    if (!message) {
      await sendMessage(senderId, { text: '❗ Please provide a message to send.' }, pageAccessToken);
      return;
    }

    try {
      await sendMessage(senderId, { text: '📤 Sending notifications... Please wait.' }, pageAccessToken);
      await sendNotificationToAllUsers(message, pageAccessToken);
      await sendMessage(senderId, { text: '✅ Notifications sent successfully.' }, pageAccessToken);
    } catch (error) {
      console.error('Error executing sendnoti command:', error.message || error);
      await sendMessage(senderId, { text: '❌ An error occurred while sending notifications.' }, pageAccessToken);
    }
  },
};
