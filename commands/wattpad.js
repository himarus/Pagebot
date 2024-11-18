const WattpadScraper = require("wattpad-scraper");
const { sendMessage } = require("../handles/sendMessage");

const scraper = new WattpadScraper();
let searchResultsCache = {};

// Gothic font mapping
const gothicFont = {
  A: "𝖠", B: "𝖡", C: "𝖢", D: "𝖣", E: "𝖤", F: "𝖥", G: "𝖦", H: "𝖧", I: "𝖨", J: "𝖩", K: "𝖪", L: "𝖫", M: "𝖬", N: "𝖭", O: "𝖮", P: "𝖯", Q: "𝖰", R: "𝖱",
  S: "𝖲", T: "𝖳", U: "𝖴", V: "𝖵", W: "𝖶", X: "𝖷", Y: "𝖸", Z: "𝖹",
  a: "𝖺", b: "𝖻", c: "𝖼", d: "𝖽", e: "𝖾", f: "𝖿", g: "𝗀", h: "𝗁", i: "𝗂",
  j: "𝗃", k: "𝗄", l: "𝗅", m: "𝗆", n: "𝗇", o: "𝗈", p: "𝗉", q: "𝗊", r: "𝗋",
  s: "𝗌", t: "𝗍", u: "𝗎", v: "𝗏", w: "𝗐", x: "𝗑", y: "𝗒", z: "𝗓",
  0: "𝟢", 1: "𝟣", 2: "𝟤", 3: "𝟥", 4: "𝟦", 5: "𝟧", 6: "𝟨", 7: "𝟩", 8: "𝟪", 9: "𝟫",
};

// Gothic text converter
function toGothic(text) {
  return text.split("").map((char) => gothicFont[char] || char).join("");
}

module.exports = {
  name: "wattpad",
  description: "Search and read Wattpad stories (title or chapter-based).",
  author: "Churchill",

  async execute(senderId, args, pageAccessToken) {
    const mainArg = args[0]?.toLowerCase();
    const query = args.slice(1).join(" ");

    if (!mainArg) {
      return sendMessage(
        senderId,
        {
          text: toGothic(
            `✨ 𝗪𝗮𝘁𝘁𝗽𝗮𝗱 𝗖𝗼𝗺𝗺𝗮𝗻𝗱𝘀\n\n` +
              `📚 𝗦𝗲𝗮𝗿𝗰𝗵 𝗦𝘁𝗼𝗿𝗶𝗲𝘀:\n  𝗨𝘀𝗲 "𝘄𝗮𝘁𝘁𝗽𝗮𝗱 [𝘁𝗶𝘁𝗹𝗲]" 𝘁𝗼 𝘀𝗲𝗮𝗿𝗰𝗵.\n\n` +
              `📖 𝗥𝗲𝗮𝗱 𝗮 𝗖𝗵𝗮𝗽𝘁𝗲𝗿:\n  𝗨𝘀𝗲 "𝘄𝗮𝘁𝘁𝗽𝗮𝗱 𝗿𝗲𝗮𝗱 [𝘀𝘁𝗼𝗿𝘆 𝗻𝘂𝗺𝗯𝗲𝗿] [𝗰𝗵𝗮𝗽𝘁𝗲𝗿 𝗻𝘂𝗺𝗯𝗲𝗿]"\n` +
              `  𝗘𝘅𝗮𝗺𝗽𝗹𝗲: 𝘄𝗮𝘁𝘁𝗽𝗮𝗱 𝗿𝗲𝗮𝗱 𝟭 𝟮`
          ),
        },
        pageAccessToken
      );
    }

    try {
      if (mainArg === "read") {
        await readStoryChapter(senderId, args, pageAccessToken);
      } else {
        await searchStories(senderId, query, pageAccessToken);
      }
    } catch (error) {
      console.error("Error in Wattpad command:", error);
      sendMessage(senderId, { text: `⚠️ ${toGothic("𝗘𝗿𝗿𝗼𝗿:")} ${error.message}` }, pageAccessToken);
    }
  },
};

async function searchStories(senderId, query, pageAccessToken) {
  try {
    const stories = await scraper.search(query);
    if (!stories.length) {
      return sendMessage(senderId, { text: toGothic(`🔍 𝗡𝗼 𝘀𝘁𝗼𝗿𝗶𝗲𝘀 𝗳𝗼𝘂𝗻𝗱 𝗳𝗼𝗿 "${query}".`) }, pageAccessToken);
    }

    searchResultsCache[senderId] = stories;

    const resultText = stories
      .map(
        (story, index) =>
          `${toGothic(index + 1)}. ${toGothic("𝗧𝗶𝘁𝗹𝗲")}: ${toGothic(story.title)}\n` +
          `   ${toGothic("𝗔𝘂𝘁𝗵𝗼𝗿")}: ${toGothic(story.author)}\n` +
          `   ${toGothic("𝗥𝗲𝗮𝗱𝘀")}: ${story.reads} | ${toGothic("𝗩𝗼𝘁𝗲𝘀")}: ${story.votes}\n` +
          `   ${toGothic("𝗗𝗲𝘀𝗰𝗿𝗶𝗽𝘁𝗶𝗼𝗻")}: ${story.description.slice(0, 100)}...`
      )
      .join("\n\n");

    sendMessage(
      senderId,
      {
        text: `${toGothic(`🔍 𝗦𝗲𝗮𝗿𝗰𝗵 𝗥𝗲𝘀𝘂𝗹𝘁𝘀 𝗳𝗼𝗿 "${query}":`)}\n\n${resultText}\n\n` +
          `${toGothic("📖 𝗧𝗼 𝗥𝗲𝗮𝗱: 𝘄𝗮𝘁𝘁𝗽𝗮𝗱 𝗿𝗲𝗮𝗱 [𝘀𝘁𝗼𝗿𝘆 𝗻𝘂𝗺𝗯𝗲𝗿] [𝗰𝗵𝗮𝗽𝘁𝗲𝗿 𝗻𝘂𝗺𝗯𝗲𝗿]")}`,
      },
      pageAccessToken
    );
  } catch (error) {
    throw new Error("𝗙𝗮𝗶𝗹𝗲𝗱 𝘁𝗼 𝘀𝗲𝗮𝗿𝗰𝗵 𝗪𝗮𝘁𝘁𝗽𝗮𝗱 𝘀𝘁𝗼𝗿𝗶𝗲𝘀.");
  }
}

async function readStoryChapter(senderId, args, pageAccessToken) {
  const storyNumber = parseInt(args[1], 10);
  const chapterNumber = parseInt(args[2], 10);

  if (isNaN(storyNumber) || isNaN(chapterNumber)) {
    return sendMessage(
      senderId,
      { text: toGothic(`⚠️ 𝗣𝗹𝗲𝗮𝘀𝗲 𝗽𝗿𝗼𝘃𝗶𝗱𝗲 𝘃𝗮𝗹𝗶𝗱 𝗻𝘂𝗺𝗯𝗲𝗿𝘀 𝗳𝗼𝗿 𝘀𝘁𝗼𝗿𝘆 𝗮𝗻𝗱 𝗰𝗵𝗮𝗽𝘁𝗲𝗿.`) },
      pageAccessToken
    );
  }

  const stories = searchResultsCache[senderId];
  if (!stories || !stories[storyNumber - 1]) {
    return sendMessage(senderId, { text: toGothic(`⚠️ 𝗦𝘁𝗼𝗿𝘆 ${storyNumber} 𝗻𝗼𝘁 𝗳𝗼𝘂𝗻𝗱. 𝗦𝗲𝗮𝗿𝗰𝗵 𝗳𝗶𝗿𝘀𝘁 𝘁𝗼 𝗴𝗲𝘁 𝗮 𝗹𝗶𝘀𝘁.`) }, pageAccessToken);
  }

  try {
    const story = stories[storyNumber - 1];
    const chapter = await scraper.getChapter(story.url, chapterNumber);

    sendMessage(
      senderId,
      {
        text: `${toGothic(`📖 𝗦𝘁𝗼𝗿𝘆:`)} ${toGothic(story.title)}\n` +
          `${toGothic("📄 𝗖𝗵𝗮𝗽𝘁𝗲𝗿:")} ${chapter.title}\n\n${chapter.content.slice(0, 3000)}`,
      },
      pageAccessToken
    );
  } catch (error) {
    throw new Error("𝗙𝗮𝗶𝗹𝗲𝗱 𝘁𝗼 𝗿𝗲𝗮𝗱 𝘁𝗵𝗲 𝗰𝗵𝗮𝗽𝘁𝗲𝗿.");
  }
}
