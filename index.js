const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const { handleMessage } = require('./handles/handleMessage');
const { handlePostback } = require('./handles/handlePostback');
const { sendMessage } = require('./handles/sendMessage');
const { exec, spawn } = require("child_process");

const app = express();
app.use(bodyParser.json());

const VERIFY_TOKEN = 'pagebot';
const PAGE_ACCESS_TOKEN = fs.readFileSync('token.txt', 'utf8').trim();
const pogi = "index.js";
const kupal = __dirname + "/" + pogi;
const chilli = './restart.json';
const GIT_REPO = "https://github.com/churchillitos/kupalka.git";
const LOG_FILE = 'server.log';

function logMessage(message, level = "info") {
  const logEntry = `[${new Date().toISOString()}] [${level.toUpperCase()}]: ${message}\n`;
  fs.appendFileSync(LOG_FILE, logEntry);
  if (level === "error" || level === "warn") {
    console.error(logEntry);
  } else if (level === "info") {
    console.log(message);
  }
}

app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      res.status(200).send(challenge);
      logMessage("Webhook verified successfully");
    } else {
      res.sendStatus(403);
      logMessage("Webhook verification failed", "warn");
    }
  }
});

app.post('/webhook', (req, res) => {
  const body = req.body;

  if (body.object === 'page') {
    body.entry.forEach(entry => {
      entry.messaging.forEach(event => {
        if (event.message) {
          handleMessage(event, PAGE_ACCESS_TOKEN);
        } else if (event.postback) {
          handlePostback(event, PAGE_ACCESS_TOKEN);
        }
      });
    });
    res.status(200).send('EVENT_RECEIVED');
    logMessage("Webhook event received");
  } else {
    res.sendStatus(404);
    logMessage("Received unsupported event", "warn");
  }
});

function executeCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, { cwd: __dirname, shell: true }, (error, stdout, stderr) => {
      if (error) {
        logMessage(`Command failed: ${error.message}`, "error");
        return reject(error);
      }
      logMessage(`Command executed: ${command}`);
      resolve(stdout);
    });
  });
}

async function loadBot() {
  try {
    await executeCommand(`git pull ${GIT_REPO} main --ff-only`);
    logMessage("Code updated from repository");
  } catch (error) {
    logMessage("Failed to update code from the repository. Proceeding without update.", "error");
  }

  const executeBot = (cmd, args) => {
    return new Promise((resolve) => {
      let process_ = spawn(cmd, args, {
        cwd: __dirname,
        stdio: ["ignore", "ignore", "inherit"],
        shell: true,
      });

      process_.on("close", (exitCode) => {
        if (exitCode === 1) {
          loadBot();
        } else {
          logMessage(`Bot stopped with code ${exitCode}`, "warn");
        }
        resolve();
      });
    });
  };

  if (fs.existsSync(chilli) && fs.statSync(chilli).size > 0) {
    try {
      const restartData = JSON.parse(fs.readFileSync(chilli, 'utf8'));
      const adminId = restartData.restartId;
      const restartTime = new Date().toLocaleString('en-PH', { timeZone: 'Asia/Manila' });
      sendMessage(adminId, { text: `Successfully restarted the bot. Time: ${restartTime}` }, PAGE_ACCESS_TOKEN);
      fs.unlinkSync(chilli);
      logMessage("Restart notification sent to admin");
    } catch (error) {
      logMessage(`Error parsing restart file: ${error.message}`, "error");
    }
  }

  executeBot("node", [kupal]).catch(console.error);
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logMessage(`Server is running on port ${PORT}`);
  loadBot();
});
