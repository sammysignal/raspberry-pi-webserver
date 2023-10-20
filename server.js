const { readFileSync, writeFileSync, readdir } = require("fs");
const ejs = require("ejs");
const express = require("express");
const bodyParser = require("body-parser");
const config = require("./config");
const { Blob } = require("buffer");

const app = express();

app.use(express.static("public"));

app.listen(config.port, () => {
  console.log(`http://localhost:${config.port}`);
  console.log(config.port);
});

app.get("/", (req, res) => {
  const count = readFileSync("./count.txt", "utf-8");
  console.log("count", count);
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

app.get("/record", (req, res) => {
  ejs.renderFile("./record.html", { port: config.port }, {}, function (err, str) {
    if (err) {
      console.log(err);
    }
    res.send(str);
  });
});

app.get("/listen", (req, res) => {
  readdir("./public/messages", (err, files) => {
    if (!files) {
      res.send("No messages.");
      return;
    }
    const filesWithPrefix = files.map((file) => {
      return "messages/" + file;
    });

    console.log(files);
    ejs.renderFile("./listen.html", { messages: filesWithPrefix }, {}, function (err, str) {
      if (err) {
        console.log(err);
      }
      res.send(str);
    });
  });
});

app.post("/upload", express.raw({ type: "*/*", limit: "6mb" }), async (req, res) => {
  console.log("received upload");
  //   const body = req.body;
  //   const blob = new Blob([body], { type: "application/octet-stream" });
  //   const arrayBuffer = await blob.arrayBuffer();
  //   const buffer = Buffer.from(arrayBuffer);

  const body = req.body;
  const buffer = Buffer.from(body);

  const dateTime = new Date().toISOString();
  writeFileSync(`./public/messages/${dateTime}.wav`, buffer);
  return res.send("done!");
});
