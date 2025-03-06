require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const dns = require("dns");
const crypto = require("crypto");
const urlBox = [];

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

app.use(express.urlencoded({ extended: true }));

// Your first API endpoint
app.get("/api/hello", function (req, res) {
  res.json({ greeting: "hello API" });
});

app.post("/api/shorturl", (req, res) => {
  let url;
  try {
    url = new URL(req.body.url);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      throw new Error("Invalid protocol");
    }
  } catch (err) {
    return res.json({ error: "invalid url" });
  }
  dns.lookup(url.hostname, (err) => {
    if (err) {
      return res.json({ error: "invalid url" });
    }
  });
  const hash = crypto.createHash("md5").update(url.href).digest("hex");
  urlBox.push({ original_url: url.href, short_url: hash });
  res.json({ original_url: url.href, short_url: hash });
});

app.get("/api/shorturl/:url", (req, res) => {
  const userUrl = req.params.url;
  const originUrl = urlBox.find((el) => el.short_url === userUrl)?.original_url;
  if (originUrl) {
    res.redirect(originUrl);
  } else {
    res.json({ error: "invalid url" });
  }
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
