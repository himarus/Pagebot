const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { sendMessage } = require('./sendMessage');
const { handleTikTokVideo } = require('./handleTikTok');
const { handleFacebookReelsVideo } = require('./handleFb');
const { handleInstagramVideo } = require('./handleInstadl');
const { handleCommand } = require('./handleCommand'); // Import handleCommand
const commands = new Map();
const lastImageByUser = new Map();
const lastVideoByUser = new Map();

// Dynamically load commands from the commands directory
const commandFiles = fs.readdirSync(path.join(__dirname, '../commands')).filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
  const command = require(path.join(__dirname, '../commands', file));
  if (command.name && typeof command.name === 'string') {
    commands.set(command.name.toLowerCase(), command);
  }
}

async function handleMessage(event, pageAccessToken) {
  if (!event || !event.sender || !event.sender.id) return;

  const senderId = event.sender.id;

  if (event.message && event.message.attachments) {
    const imageAttachment = event.message.attachments.find(att => att.type === 'image');
    const videoAttachment = event.message.attachments.find(att => att.type === 'video');

    if (imageAttachment) lastImageByUser.set(senderId, imageAttachment.payload.url);
    if (videoAttachment) lastVideoByUser.set(senderId, videoAttachment.payload.url);
  }

  if (event.message && event.message.text) {
    const messageText = event.message.text.trim().toLowerCase();

    if (await handleFacebookReelsVideo(event, pageAccessToken)) return;
    if (await handleTikTokVideo(event, pageAccessToken)) return;
    if (await handleInstagramVideo(event, pageAccessToken)) return;

    if (messageText === 'removebg') {
      const lastImage = lastImageByUser.get(senderId);
      if (lastImage) {
        try {
          await commands.get('removebg').execute(senderId, [], pageAccessToken, lastImage);
          lastImageByUser.delete(senderId);
        } catch (error) {
          await sendMessage(senderId, { text: 'An error occurred while processing the image.' }, pageAccessToken);
        }
      } else {
        await sendMessage(senderId, { text: 'Please send an image first, then type "removebg" to remove its background.' }, pageAccessToken);
      }
      return;
    }

    if (messageText === 'imgur') {
      const lastImage = lastImageByUser.get(senderId);
      const lastVideo = lastVideoByUser.get(senderId);
      const mediaToUpload = lastImage || lastVideo;

      if (mediaToUpload) {
        try {
          await commands.get('imgur').execute(senderId, [], pageAccessToken, mediaToUpload);
          lastImageByUser.delete(senderId);
          lastVideoByUser.delete(senderId);
        } catch (error) {
          await sendMessage(senderId, { text: 'An error occurred while uploading the media to Imgur.' }, pageAccessToken);
        }
      } else {
        await sendMessage(senderId, { text: 'Please send an image or video first, then type "imgur" to upload.' }, pageAccessToken);
      }
      return;
    }

    if (messageText.startsWith('gemini')) {
      const lastImage = lastImageByUser.get(senderId);
      const args = messageText.split(/\s+/).slice(1);

      try {
        await commands.get('gemini').execute(senderId, args, pageAccessToken, event, lastImage);
        lastImageByUser.delete(senderId);
      } catch (error) {
        await sendMessage(senderId, { text: 'An error occurred while processing the Gemini command.' }, pageAccessToken);
      }
      return;
    }

    let commandName, args;
    if (messageText.startsWith('-')) {
      const argsArray = messageText.slice(1).trim().split(/\s+/);
      commandName = argsArray.shift().toLowerCase();
      args = argsArray;
    } else {
      const words = messageText.trim().split(/\s+/);
      commandName = words.shift().toLowerCase();
      args = words;
    }

    if (commands.has(commandName)) {
      const command = commands.get(commandName);
      try {
        let imageUrl = '';
        if (event.message.reply_to && event.message.reply_to.mid) {
          try {
            imageUrl = await getAttachments(event.message.reply_to.mid, pageAccessToken);
          } catch (error) {
            imageUrl = '';
          }
        } else if (lastImageByUser.has(senderId)) {
          imageUrl = lastImageByUser.get(senderId);
          lastImageByUser.delete(senderId);
        }

        await command.execute(senderId, args, pageAccessToken, event, imageUrl);
      } catch (error) {
        sendMessage(senderId, { text: `There was an error executing the command "${commandName}". Please try again later.` }, pageAccessToken);
      }
    } else {
      await handleCommand(senderId, commandName, args, pageAccessToken); // Use handleCommand for auto commands
    }
  }
}

async function getAttachments(mid, pageAccessToken) {
  if (!mid) throw new Error("No message ID provided.");

  try {
    const { data } = await axios.get(`https://graph.facebook.com/v21.0/${mid}/attachments`, {
      params: { access_token: pageAccessToken }
    });

    if (data && data.data.length > 0 && data.data[0].image_data) {
      return data.data[0].image_data.url;
    } else {
      throw new Error("No image found in the replied message.");
    }
  } catch (error) {
    throw new Error("Failed to fetch attachments.");
  }
}

module.exports = { handleMessage };
