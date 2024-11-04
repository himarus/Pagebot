const fs = require('fs');
const path = require('path');
const { sendMessage } = require('../handles/sendMessage');

const gothicFont = {
  A: "𝖠", B: "𝖡", C: "𝖢", D: "𝖣", E: "𝖤", F: "𝖥", G: "𝖦", H: "𝖧", I: "𝖨", J: "𝖩", K: "𝖪", L: "𝖫", M: "𝖬", N: "𝖭", O: "𝖮", P: "𝖯", Q: "𝖰", R: "𝖱",
  S: "𝖲", T: "𝖳", U: "𝖴", V: "𝖵", W: "𝖶", X: "𝖷", Y: "𝖸", Z: "𝖹", 
  a: "𝖺", b: "𝖻", c: "𝖼", d: "𝖽", e: "𝖾", f: "𝖿", g: "𝗀", h: "𝗁", i: "𝗂",
  j: "𝗃", k: "𝗄", l: "𝗅", m: "𝗆", n: "𝗇", o: "𝗈", p: "𝗉", q: "𝗊", r: "𝗋",
  s: "𝗌", t: "𝗍", u: "𝗎", v: "𝗏", w: "𝗐", x: "𝗑", y: "𝗒", z: "𝗓",
  0: "𝟢", 1: "𝟣", 2: "𝟤", 3: "𝟥", 4: "𝟦", 5: "𝟧", 6: "𝟨", 7: "𝟩", 8: "𝟪", 9: "𝟫"
};

const convertToGothic = (text) => {
  return text.split('').map(char => gothicFont[char] || char).join('');
};

module.exports = {
  name: 'help',
  description: 'Show available commands',
  author: 'chilli',
  execute(senderId, args, pageAccessToken) {
    const commandsDir = path.join(__dirname, '../commands');
    const commandFiles = fs.readdirSync(commandsDir).filter(file => file.endsWith('.js'));

    const commands = commandFiles.map((file) => {
      const command = require(path.join(commandsDir, file));
      if (command.name) {
        return {
          title: command.name,
          payload: `${command.name.toUpperCase()}_PAYLOAD`
        };
      }
      console.warn(`Command file "${file}" is missing a "name" property.`);
      return null;
    }).filter(cmd => cmd !== null);

    const totalCommands = commands.length;
    const commandsPerPage = 5;
    const totalPages = Math.ceil(totalCommands / commandsPerPage);
    let page = parseInt(args[0], 10);

    if (isNaN(page) || page < 1) {
      page = 1;
    }

    if (args[0] && args[0].toLowerCase() === 'all') {
      const helpTextMessage = `${convertToGothic('📋 | 𝖢𝖬𝖣𝖲 𝖫𝗂𝗌𝗍: 〔𝗇𝗈 𝗉𝗋𝖾𝖿𝗂𝗑〕')}\n${convertToGothic(`🏷 Total Commands: ${totalCommands}`)}\n\n${commands.map((cmd, index) => `${convertToGothic(`${index + 1}. ${cmd.title}`)}`).join('\n\n')}\n\n${convertToGothic('If you have any problems with the pagebot, contact the developer:')}\nFB Link: https://www.facebook.com/Churchill.Dev4100`;

      return sendMessage(senderId, {
        text: helpTextMessage
      }, pageAccessToken);
    }

    const startIndex = (page - 1) * commandsPerPage;
    const endIndex = startIndex + commandsPerPage;
    const commandsForPage = commands.slice(startIndex, endIndex);

    if (commandsForPage.length === 0) {
      return sendMessage(senderId, { text: convertToGothic(`Invalid page number. There are only ${totalPages} pages.`) }, pageAccessToken);
    }

    const helpTextMessage = `${convertToGothic('📋 | 𝖢𝖬𝖣𝖲 𝖫𝗂𝗌𝗍: 〔𝗇𝗈 𝗉𝗋𝖾𝖿𝗂𝗑〕 (Page ')}${page}${convertToGothic(` of ${totalPages}):`)}\n${convertToGothic(`🏷 Total Commands: ${totalCommands}`)}\n\n${commandsForPage.map((cmd, index) => `${convertToGothic(`${startIndex + index + 1}. ${cmd.title}`)}`).join('\n\n')}\n\n${convertToGothic('Type "help [page]" to see another page, or "help all" to show all commands.')}\n\n${convertToGothic('If you have any problems with the pagebot, contact the developer:')}\nFB Link: https://www.facebook.com/Churchill.Dev4100`;

    const quickRepliesPage = commandsForPage.map((cmd) => ({
      content_type: "text",
      title: cmd.title,
      payload: cmd.payload
    }));

    sendMessage(senderId, {
      text: helpTextMessage,
      quick_replies: quickRepliesPage
    }, pageAccessToken);
  }
};
