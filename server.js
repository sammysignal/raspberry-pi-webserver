// Library imports
const { readFileSync, writeFileSync, readdir, unlink } = require("fs");
const ejs = require("ejs");
const express = require("express");
const bodyParser = require("body-parser");
const { OpenAI, toFile } = require("openai");

// Local imports
const { getAudioText, getOpenAICompletion, sendNotificationEmail } = require("./backend/completion");
const config = require("./config");

const openai = new OpenAI({
  apiKey: config.OPENAI_API_KEY,
});

const app = express();

app.use(express.static("public"));

app.listen(config.PORT, () => {
  console.log(`http://localhost:${config.PORT}`);
  console.log(config.PORT);
});

// Parse JSON bodies for this app.
app.get("/", (req, res) => {
  const count = readFileSync("./count.txt", "utf-8");
  const newCount = parseInt(count) + 1;
  writeFileSync("./count.txt", newCount.toString());

  const browser = req.headers["user-agent"];

  let data = {
    count: newCount.toString(),
    browser: browser,
  };

  ejs.renderFile("./index.html", data, {}, function (err, str) {
    if (err) {
      console.log(err);
    }
    res.send(str);
  });
});

// Record a message
app.get("/record", (req, res) => {
  ejs.renderFile("./record.html", {}, {}, function (err, str) {
    if (err) {
      console.log(err);
    }
    res.send(str);
  });
});

// Get the messages. Hidden endpoint
app.get(`/${config.VOICEMAIL_ACCESS_URL}`, (req, res) => {
  readdir("./public/messages", (e, files) => {
    if (e) {
      console.error(e);
    }
    if (!files) {
      res.send("No messages.");
      return;
    }
    const filesWithPrefix = files.map((file) => {
      return "messages/" + file;
    });

    ejs.renderFile("./listen.html", { messages: filesWithPrefix }, {}, function (err, str) {
      if (err) {
        console.log(err);
      }
      res.send(str);
    });
  });
});

// Clear all messages. Hidden endpoint
app.post(`/${config.VOICEMAIL_ACCESS_URL}delete`, (req, res) => {
  readdir("./public/messages", (e, files) => {
    if (e) {
      console.error(e);
    }
    if (!files) {
      res.json('{ message: "No files to delete." }');
      return;
    }

    files.forEach((file) => {
      unlink(`./public/messages/${file}`, (err) => {
        if (err) {
          console.error(err);
        }
      });
    });

    res.json('{ message: "Messages deleted." }');
  });
});

// Delete a single message.
// expecting queryParam of the form toDelete=messages/blah.wav
app.post(`/${config.VOICEMAIL_ACCESS_URL}deleteOne`, (req, res) => {
  console.log('req.query:')
  console.log(req.query);
  const fileToDelete = req.query['toDelete'].split('/')[1];
  console.log('deleting file:')
  console.log(fileToDelete);
  unlink(`./public/messages/${fileToDelete}`,  (err) => {
    if (err) {
      console.error(err);
    }
  });
  res.json('{ message: "Message deleted." }');
});

// Upload an audio file message, and get a response from OpenAI
app.post("/upload", express.raw({ type: "*/*", limit: "6mb" }), async (req, res) => {
  console.log("received upload");

  readdir("./public/messages", async (err, files) => {
    if (err) {
      console.error(err);
    }

    if (files.length > 20) {
      res.send('{"message":"Message inbox full."}');
      return;
    }

    const body = req.body;
    const audioBuffer = Buffer.from(body);

    const dateTime = new Date().toISOString();
    writeFileSync(`./public/messages/${dateTime}.wav`, audioBuffer);

    // Convert audio buffer to file
    const audioFile = await toFile(audioBuffer, "userInput.wav");

    // Convert audio to text
    const text = await getAudioText(openai, audioFile);

    // Get completion from OpenAI
    const completion = await getOpenAICompletion(openai, text);

    sendNotificationEmail(text, completion);

    let response = {
      message: completion,
    };

    response.message = "Message received! " + response.message;

    return res.json(response);
  });
});
