const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

const pageid = '493920247130641';
const adminId = '8731046750250922';
const kupal = [""];

async function getAllPSIDs(pageAccessToken) {
  try {
    let psids = [];
    let previous = `https://graph.facebook.com/v21.0/${pageid}/conversations?fields=participants&access_token=${pageAccessToken}`;
    
    while (previous) {
      const response = await axios.get(previous);
      if (response && response.data && response.data.data) {
        const conversations = response.data.data;
        conversations.forEach(convo => {
          convo.participants.data.forEach(participant => {
            if (participant.id !== pageid && !kupal.includes(participant.id)) {
              psids.push(participant.id);
            }
          });
        });
        previous = response.data.paging && response.data.paging.next || null;
      } else {
        console.error('Invalid response data:', response);
        break;
      }
    }
    return psids;
  } catch (error) {
    console.error('Error fetching PSIDs:', error);
    return [];
  }
}

async function sendNotificationToAllUsers(message, pageAccessToken) {
  const users = await getAllPSIDs(pageAccessToken);

  for (const psid of users) {
    try {
      await axios.post(`https://graph.facebook.com/v21.0/me/messages?access_token=${pageAccessToken}`, {
        recipient: { id: psid },
        message: {
          text: `📢 Notification from Admin: ${message}`,
        },
      });
    } catch (error) {
      console.error('Error sending notification to user:', psid, error);
    }
  }
}

module.exports = {
  name: 'sendnoti',
  description: 'Send notification to all users who have messaged the page.',
  author: 'Cliff',
  usage: "sendnoti <message>",

  async execute(senderId, args, pageAccessToken, sendMessage) {
    if (senderId !== adminId) {
      sendMessage(senderId, { text: "This command is only for the pagebot owner." }, pageAccessToken);
      return;
    }

    const message = args.join(' ');
    if (!message) {
      sendMessage(senderId, { text: 'Please provide a text message to send.' }, pageAccessToken);
      return;
    }

    try {
      sendMessage(senderId, { text: 'Sending notifications...' }, pageAccessToken);
      await sendNotificationToAllUsers(message, pageAccessToken);
      sendMessage(senderId, { text: 'Notifications sent successfully.' }, pageAccessToken);
    } catch (error) {
      sendMessage(senderId, { text: 'An error occurred while sending notifications.' }, pageAccessToken);
      sendMessage(senderId, { text: error.message || 'Unknown error occurred.' }, pageAccessToken);
    }
  }
};
