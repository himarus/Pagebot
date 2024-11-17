const WattpadScraper = require('wattpad-scraper');
const { sendMessage } = require('../handles/sendMessage');

const scraper = new WattpadScraper();

module.exports = {
  name: "wattpad",
  description: "Interact with Wattpad stories (search, read chapters, list parts).",
  author: "Churchill",

  async execute(senderId, args, pageAccessToken) {
    const command = args[0]?.toLowerCase();
    const query = args.slice(1).join(" ");

    if (!command || !query) {
      return sendMessage(senderId, {
        text: `✨ Wattpad Commands:
- 🔍 Search: wattpad search [query]
- 📑 List Parts: wattpad parts [story URL]
- 📖 Read Chapter: wattpad read [chapter URL]`,
      }, pageAccessToken);
    }

    try {
      switch (command) {
        case "search":
          await searchStories(senderId, query, pageAccessToken);
          break;
        case "parts":
          await listStoryParts(senderId, query, pageAccessToken);
          break;
        case "read":
          await readChapter(senderId, query, pageAccessToken);
          break;
        default:
          sendMessage(senderId, { text: "❓ Unknown command. Use 'wattpad' for help." }, pageAccessToken);
      }
    } catch (error) {
      console.error("Error in Wattpad command:", error);
      sendMessage(senderId, { text: `⚠️ Error: ${error.message}` }, pageAccessToken);
    }
  },
};

async function searchStories(senderId, query, pageAccessToken) {
  try {
    const stories = await scraper.search(query);
    if (!stories.length) {
      return sendMessage(senderId, { text: `🔍 No stories found for "${query}".` }, pageAccessToken);
    }

    const resultText = stories.slice(0, 5).map((story, index) => (
      `${index + 1}. ${story.title} by ${story.author}\n   Reads: ${story.reads} | Votes: ${story.votes}\n   Link: ${story.link}`
    )).join("\n\n");

    sendMessage(senderId, { text: `🔍 Search Results for "${query}":\n\n${resultText}` }, pageAccessToken);
  } catch (error) {
    throw new Error("Failed to search Wattpad stories.");
  }
}

async function listStoryParts(senderId, storyUrl, pageAccessToken) {
  try {
    const parts = await scraper.getParts(storyUrl);
    if (!parts.length) {
      return sendMessage(senderId, { text: `📑 No parts found for the story.` }, pageAccessToken);
    }

    const partsText = parts.map((part, index) => (
      `${index + 1}. ${part.title}\n   Link: ${part.link}`
    )).join("\n\n");

    sendMessage(senderId, { text: `📑 Story Parts:\n\n${partsText}` }, pageAccessToken);
  } catch (error) {
    throw new Error("Failed to fetch story parts.");
  }
}

async function readChapter(senderId, chapterUrl, pageAccessToken) {
  try {
    const pages = await scraper.read(chapterUrl);
    if (!pages.length) {
      return sendMessage(senderId, { text: `📖 No content found for the chapter.` }, pageAccessToken);
    }

    const contentText = pages.map((page) => `Page ${page.pageNumber}:\n${page.content}`).join("\n\n");
    sendMessage(senderId, { text: `📖 Chapter Content:\n\n${contentText}` }, pageAccessToken);
  } catch (error) {
    throw new Error("Failed to read the chapter.");
  }
}
