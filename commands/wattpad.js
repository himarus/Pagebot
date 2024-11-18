const WattpadScraper = require('wattpad-scraper');
const { sendMessage } = require('../handles/sendMessage');

const scraper = new WattpadScraper();
const storyCache = {};
const storyPartsCache = {};

module.exports = {
  name: "wattpad",
  description: "Interact with Wattpad stories (search, read chapters, list parts).",
  author: "Churchill",

  async execute(senderId, args, pageAccessToken) {
    const command = args[0]?.toLowerCase();
    const query = args.join(" ");

    if (!command) {
      return sendMessage(senderId, {
        text: `✨ Wattpad Commands:

- 📚 **Search**: 
  \`wattpad [title]\` to search for stories.

- 📑 **List Parts**: 
  \`wattpad parts [story number]\` to view story parts.

- 📖 **Read Chapter**: 
  \`wattpad read [story number] [part number]\` to read a specific chapter.`,
      }, pageAccessToken);
    }

    try {
      if (command === "parts") {
        await listStoryParts(senderId, args[1], pageAccessToken);
      } else if (command === "read") {
        await readChapter(senderId, args[1], args[2], pageAccessToken);
      } else {
        await searchStories(senderId, query, pageAccessToken);
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

    const uniqueId = Date.now();
    storyCache[uniqueId] = stories;

    const resultText = stories.slice(0, 5).map((story, index) => (
      `${index + 1}. Title: ${story.title}\n   Author: ${story.author}\n   Reads: ${story.reads} | Votes: ${story.votes}`
    )).join("\n\n");

    sendMessage(senderId, {
      text: `🔍 Search Results for "${query}":\n\n${resultText}\n\n📑 Use: \`wattpad parts [story number]\` to view parts.`,
    }, pageAccessToken);
  } catch (error) {
    throw new Error("Failed to search Wattpad stories.");
  }
}

async function listStoryParts(senderId, storyNumber, pageAccessToken) {
  try {
    const uniqueId = Object.keys(storyCache).pop();
    const stories = storyCache[uniqueId];

    if (!stories || !stories[storyNumber - 1]) {
      return sendMessage(senderId, { text: `⚠️ Invalid story number.` }, pageAccessToken);
    }

    const selectedStory = stories[storyNumber - 1];
    const parts = await scraper.getParts(selectedStory.link);

    if (!parts.length) {
      return sendMessage(senderId, { text: `📑 No parts found for this story.` }, pageAccessToken);
    }

    storyPartsCache[storyNumber] = parts;

    const partsText = parts.map((part, index) => (
      `${index + 1}. Part: ${part.title}`
    )).join("\n\n");

    sendMessage(senderId, {
      text: `📑 Parts for "${selectedStory.title}":\n\n${partsText}\n\n📖 Use: \`wattpad read [story number] [part number]\` to read a specific part.`,
    }, pageAccessToken);
  } catch (error) {
    throw new Error("Failed to fetch story parts.");
  }
}

async function readChapter(senderId, storyNumber, partNumber, pageAccessToken) {
  try {
    const parts = storyPartsCache[storyNumber];

    if (!parts || !parts[partNumber - 1]) {
      return sendMessage(senderId, { text: `⚠️ Invalid part number or story number.` }, pageAccessToken);
    }

    const selectedPart = parts[partNumber - 1];
    const pages = await scraper.read(selectedPart.link);

    if (!pages.length) {
      return sendMessage(senderId, { text: `📖 No content found for this chapter.` }, pageAccessToken);
    }

    const contentText = pages.map((page) => `Page ${page.pageNumber}:\n${page.content}`).join("\n\n");
    sendMessage(senderId, { text: `📖 Chapter Content:\n\n${contentText}` }, pageAccessToken);
  } catch (error) {
    throw new Error("Failed to read the chapter.");
  }
}
