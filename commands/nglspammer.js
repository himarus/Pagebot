const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'nglspammer',
  description: 'Send anonymous spam messages to an NGL user',
  usage: 'nglspammer <username> | <message> | <amount>',
  author: 'chilli',

  async execute(senderId, args, pageAccessToken) {
    const input = args.join(' ').split('|').map(v => v.trim());
    const [usernameRaw, message, amountRaw] = input;

    if (!usernameRaw || !message || !amountRaw) {
      return sendMessage(senderId, {
        text: 'Usage: nglspammer <username or NGL link> | <message> | <amount>\nExample: nglspammer chillixd | Hello ka cute mo | 5'
      }, pageAccessToken);
    }

    let username = usernameRaw;
    const match = username.match(/(?:https?:\/\/)?(?:www\.)?ngl\.link\/([a-zA-Z0-9._-]+)/);
    if (match) username = match[1];

    const spamCount = parseInt(amountRaw);
    if (isNaN(spamCount) || spamCount <= 0) {
      return sendMessage(senderId, {
        text: 'Invalid amount. Please enter a number greater than 0.'
      }, pageAccessToken);
    }

    const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
    const deviceIds = [
      '23d7346e-7d22-4256-80f3-dd4ce3fd8878',
      'd9ae0123-1f67-4e90-a921-3dbcfb6e12c1',
      '7c532c3f-f40f-42b7-b55d-78f537c1a9cf',
      '9f23bc4a-09f8-4d9f-801f-6dd624aef301',
      '2a47d3d6-09a9-44dc-b2d7-497bd876fc3b',
      'abcde123-4567-89ab-cdef-0123456789ab',
      '8e7b90f3-21c4-4ee5-83f2-1fa38291f3e7',
      'd3a9b0cd-143c-41d0-b3ff-5b946234f617'
    ];

    let success = 0;
    let failed = 0;
    let sent = 0;
    const maxConcurrency = 5;

    await sendMessage(senderId, {
      text: `[⏳] Spamming ${spamCount} messages to @${username}...\nPlease wait while we process.`
    }, pageAccessToken);

    const sendSpam = async () => {
      const deviceId = deviceIds[Math.floor(Math.random() * deviceIds.length)];
      try {
        await axios.post('https://ngl.link/api/submit', {
          username,
          question: message,
          deviceId,
          gameSlug: '',
          referrer: ''
        });
        success++;
      } catch (err) {
        if (err.response?.status === 429) return 'retry';
        failed++;
      }
      await delay(100 + Math.random() * 200);
      return 'done';
    };

    while (sent < spamCount) {
      const batch = [];
      const remaining = spamCount - sent;
      const batchSize = remaining >= maxConcurrency ? maxConcurrency : remaining;

      for (let i = 0; i < batchSize; i++) {
        batch.push(sendSpam());
      }

      const results = await Promise.all(batch);
      results.forEach(result => {
        if (result === 'retry') sent--;
      });

      sent += batchSize;
      await delay(500);
    }

    await sendMessage(senderId, {
      text: `✅ Successfully spammed ${success}/${spamCount} messages to @${username}!\nFailed: ${failed}`
    }, pageAccessToken);
  }
};
