import express, { json, RequestHandler, urlencoded } from "express";
import { createWriteStream, readFileSync } from "fs";
import serveStatic from "serve-static";
import config from "./config";
import Interval from "jsinterval";
import miniget from "miniget";
import { sendEmail } from "./email";

const app = express();
const cwd = process.cwd();
const port = config.port || 3000;

const errorStream = createWriteStream(`${cwd}/error.log`, { flags: "a" });

app.set("trust proxy", true);
app.use(json());
app.use(urlencoded({ extended: true }));

// app.all('*', (req, res, next) => {
//   const currentPath = "https://archigan.repl.co" + req.path;

//   if (req.hostname.toLowerCase() !== "archigan.repl.co") {
//     res.status(301).redirect(currentPath);
//   } else if (req.get('X-Forwarded-Proto') == "http") {
//     res.status(101).redirect(currentPath);
//   } else {
//     next();
//   }
// });

app.get('/', (req, res) => res.sendFile(`${cwd}/index.html`));

app.use("/static", serveStatic(`${cwd}/static`) as RequestHandler);
app.use("/games", serveStatic(`${cwd}/games`, { extensions: ["html"] }) as RequestHandler);

// --------------------------------------------------
// Suggestions
// --------------------------------------------------

const suggestionStream = createWriteStream(`${cwd}/TODO.md`, { flags: 'a' });

app.get("/suggestion-form", (req, res) => res.sendFile(`${cwd}/suggestions/index.html`));
app.get("/api/gmail-redirect", (req, res) => res.json(req.query.code));

app.post("/suggestion-form", (req, res) => {
  const suggestion = req.body.suggestion;
  suggestionStream.write(`* ${suggestion}\n`);

  const emailContent = readFileSync(`${cwd}/suggestions/suggestion-email.html`, "utf8").replace("<SUGGESTION />", suggestion);

  sendEmail({
    from: "Website Server",
    to: config.secrets.serverEmailTo!,
    subject: "New Suggestion",
    html: emailContent
  });

  res.sendFile(`${cwd}/suggestions/received.html`);
});

// --------------------------------------------------
// Server Maintenence Code
// --------------------------------------------------

let allow = true;
app.get("/status", (req, res) => {
  res.json(allow);
  if (allow) {
    allow = false;
    setTimeout(() => allow = true, 5000);
  }
});

new Interval({
  func: () => {
    ([
      {
        url: "https://www.cookiegamer733.dev/status",
        name: "Cookie's Website"
      },
      {
        url: "https://rick-astley-bot.archigan.repl.co/",
        name: "Archigan's Bot"
      },
      {
        url: "https://walker-chatroom.archigan.repl.co/status.txt",
        name: "Walker Chatroom"
      },
      {
        url: "https://akalyzziechatbot.archigan.repl.co/",
        name: "Lyzzie's Chatbot"
      }
    ]).forEach(async website =>
      await miniget(website.url).text() === "true" ? console.log(`${website.name} Status: Online`) : console.log(`${website.name} Status: Offline`)
    );
  },
  delay: "30 Seconds",
  autoStart: true
});

// --------------------------------------------------
// Server Start-Up
// --------------------------------------------------

// 404 Message
app.all("*", (req, res) => res.status(404).sendFile(`${cwd}/error/404.html`));

// Server Start
app.listen(port, () => console.log(`Server Started on Port ${port}`));

// --------------------------------------------------
// Server Error Logging
// --------------------------------------------------

export function error(errMsg: string) {
  errorStream.write(`${errMsg}\n`);
  console.error(errMsg);
}

process.on("uncaughtException", (err, origin) => {
  error(`${new Date().toUTCString()} - Uncaught Exception: \n${err}\n\n${origin.toString()}`);
});

process.on("unhandledRejection", (err, origin) => {
  error(`${new Date().toUTCString()} - Unhandled Rejection: \n${err}\n\n${origin.toString()}`);
});