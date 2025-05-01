const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: "pastebin",
  description: "Upload a file to DedPaste (modern Pastebin alternative)",
  author: "chilli",

  async execute(senderId, args, pageAccessToken) {
    const ownerId = "8731046750250922";

    if (senderId !== ownerId) {
      return sendMessage(senderId, {
        text: '❌ You are not authorized to use this command.'
      }, pageAccessToken);
    }

    if (!args || args.length === 0) {
      return sendMessage(senderId, {
        text: '❗ Please provide a filename to upload.\nUsage: pastebin <filename>'
      }, pageAccessToken);
    }

    const fileName = args[0];
    const filePath = path.resolve(__dirname, fileName);
    const filePathWithJs = filePath.endsWith('.js') ? filePath : filePath + '.js';

    const finalPath = fs.existsSync(filePath) ? filePath : (fs.existsSync(filePathWithJs) ? filePathWithJs : null);
    if (!finalPath) {
      return sendMessage(senderId, {
        text: '❌ File not found.'
      }, pageAccessToken);
    }

    try {
      const content = fs.readFileSync(finalPath, 'utf8');
      const response = await axios.post('https://paste.d3d.dev/api/create', { content }, {
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.data || !response.data.url) throw new Error("No response URL");

      const shareUrl = response.data.url.replace('paste.d3d.dev', 'paste.d3d.dev/raw');
      await sendMessage(senderId, {
        text: `✅ File uploaded: ${shareUrl}`
      }, pageAccessToken);

    } catch (error) {
      console.error("DedPaste error:", error.response?.data || error.message || error);
      await sendMessage(senderId, {
        text: '❌ Failed to upload file to DedPaste.'
      }, pageAccessToken);
    }
  }
};
