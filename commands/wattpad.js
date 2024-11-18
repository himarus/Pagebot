const WattpadScraper = require('wattpad-scraper');
const { sendMessage } = require('../handles/sendMessage');

const scraper = new WattpadScraper();
let userStoryCache = {}; // Cache per user for story parts and details

module.exports = {
  name: "wattpad",
  description: "Directly search Wattpad stories and read chapters.",
  author: "Churchill",

  async execute(senderId, args, pageAccessToken) {
    const query = args.join(" "); // User's input is the story title

    if (!query) {
      return sendMessage(senderId, {
        text: `❓ Please specify a story title. Example: \`wattpad hell university\`.`
      }, pageAccessToken);
    }

    try {
      // Fetch story and parts directly
      await fetchStoryAndParts(senderId, query, pageAccessToken);
    } catch (error) {
      console.error("Error in Wattpad command:", error);
      sendMessage(senderId, { text: `⚠️ Error: ${error.message}` }, pageAccessToken);
    }
  },
};

async function fetchStoryAndParts(senderId, title, pageAccessToken) {
  try {
    const stories = await scraper.search(title);
    if (!stories.length) {
      return sendMessage(senderId, { text: "🔍 No stories found. Try another title." }, pageAccessToken);
    }

    const story = stories[0]; // Automatically pick the first result
    const parts = await scraper.getStoryParts(story.url);

    // Cache the parts for this user
    userStoryCache[senderId] = { story, parts };

    let partsText = `📑 **Story Parts: ${story.title}**:\n`;
    parts.forEach((part, index) => {
      partsText += `\n${index + 1}. ${part.title}`;
    });

    partsText += `\n\n📖 Use: \`read [part number]\` to read a chapter.`;
    sendMessage(senderId, { text: partsText }, pageAccessToken);
  } catch (error) {
    throw new Error("Failed to fetch story and parts.");
  }
}

async function readChapterByNumber(senderId, partNumber, pageAccessToken) {
  const userCache = userStoryCache[senderId];
  if (!userCache || !userCache.parts) {
    return sendMessage(senderId, { text: "❌ No story parts found. Search for a story first." }, pageAccessToken);
  }

  const partIndex = parseInt(partNumber) - 1;
  if (isNaN(partIndex) || partIndex < 0 || partIndex >= userCache.parts.length) {
    return sendMessage(senderId, { text: "❌ Invalid part number. Try again." }, pageAccessToken);
  }

  try {
    const part = userCache.parts[partIndex];
    const content = await scraper.getStoryPartContent(part.url);

    sendMessage(senderId, {
      text: `📖 **${part.title}**\n\n${content.slice(0, 1000)}...`, // Limit content length
      quick_replies: [{ title: "Read More", payload: `read ${partIndex + 1}` }],
    }, pageAccessToken);
  } catch (error) {
    throw new Error("Failed to fetch chapter content.");
  }
}
