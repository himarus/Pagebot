const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

const pageId = '472259739299490';
const adminId = '8731046750250922';
const excludedIds = [];

async function getAllPSIDs(pageAccessToken) {
  try {
    let psids = [];
    let nextPage = `https://graph.facebook.com/v18.0/${pageId}/conversations?fields=participants&access_token=${pageAccessToken}`;

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
        console.error('Invalid response data:', response.data);
        break;
      }
    }

    return psids;
  } catch (error) {
    console.error('Error fetching PSIDs:', error.response?.data || error.message || error);
    return [];
  }
}

async function sendNotificationToAllUsers(message, pageAccessToken) {
  const users = await getAllPSIDs(pageAccessToken);

  if (users.length === 0) {
    console.log('No users found to send notifications.');
    return;
  }

  for (const psid of users) {
    try {
      await axios.post(`https://graph.facebook.com/v18.0/me/messages?access_token=${pageAccessToken}`, {
        recipient: { id: psid },
        message: {
          text: `📢 Notification from Admin:\n\n${message}`,
        },
      });
      console.log(`Notification sent to PSID: ${psid}`);
    } catch (error) {
      console.error(`Error sending notification to PSID ${psid}:`, error.response?.data || error.message || error);
    }
  }
}

module.exports = {
  name: 'sendnoti',
  description: 'Send notification to all users who have messaged the page.',
  author: 'Cliff',
  usage: 'sendnoti <message>',
  
  async execute(senderId, args, pageAccessToken) {
    if (senderId !== adminId) {
      await sendMessage(senderId, { text: '❗ This command is only for the pagebot owner.' }, pageAccessToken);
      return;
    }

    const message = args.join(' ');
    if (!message) {
      await sendMessage(senderId, { text: '❗ Please provide a message to send.' }, pageAccessToken);
      return;
    }

    try {
      await sendMessage(senderId, { text: '📤 Sending notifications...' }, pageAccessToken);
      await sendNotificationToAllUsers(message, pageAccessToken);
      await sendMessage(senderId, { text: '✅ Notifications sent successfully.' }, pageAccessToken);
    } catch (error) {
      console.error('Error in sendnoti command:', error.response?.data || error.message || error);
      await sendMessage(senderId, {
        text: '❗ An error occurred while sending notifications. Please try again later.',
      }, pageAccessToken);
    }
  },
};
